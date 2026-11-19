<?php

namespace App\Services\Media;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response as HttpResponse;
use Illuminate\Http\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Deployment: files live in ONE private Google Drive folder.
 *
 * Uses the plain Drive v3 REST API with an OAuth refresh token (scope drive.file,
 * so this app can only touch files it created itself). No extra composer packages.
 * Nothing is ever made public in Drive: every read goes through our own controllers.
 */
class GoogleDriveMediaDriver implements MediaDriver
{
    private const API = 'https://www.googleapis.com/drive/v3/files';

    private const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private const TOKEN_KEY = 'media.drive.access_token';

    public function putFromPath(string $absolutePath, string $mime, string $folder): string
    {
        $parent = $this->subfolder($folder);
        $extension = (new File($absolutePath))->guessExtension()
            ?: (pathinfo($absolutePath, PATHINFO_EXTENSION) ?: 'bin');
        $name = Str::slug($folder).'-'.Str::uuid().'.'.$extension;

        $contents = file_get_contents($absolutePath);
        if ($contents === false) {
            throw new RuntimeException('Could not read the file to upload.');
        }

        $metadata = json_encode(
            ['name' => $name, 'parents' => [$parent], 'mimeType' => $mime],
            JSON_THROW_ON_ERROR
        );

        $boundary = 'olu_'.Str::random(32);
        $body = "--{$boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{$metadata}\r\n"
            ."--{$boundary}\r\nContent-Type: {$mime}\r\n\r\n{$contents}\r\n"
            ."--{$boundary}--";

        $response = $this->call(fn (PendingRequest $http) => $http
            ->timeout(180)
            ->withBody($body, "multipart/related; boundary={$boundary}")
            ->post(self::UPLOAD.'?uploadType=multipart&fields=id'));

        $id = $response->json('id');

        if (! $response->successful() || ! $id) {
            Log::error('Google Drive upload failed', [
                'status' => $response->status(),
                'error' => $response->json('error.message'),
            ]);

            throw new RuntimeException('Google Drive upload failed ('.$response->status().').');
        }

        return $id;
    }

    public function delete(string $ref): void
    {
        $id = $this->safeId($ref);

        if (! $id) {
            return;
        }

        $response = $this->call(fn (PendingRequest $http) => $http->delete(self::API."/{$id}"));

        if (! $response->successful() && $response->status() !== 404) {
            Log::warning('Google Drive delete failed', ['status' => $response->status(), 'id' => $id]);
        }
    }

    public function response(Request $request, string $ref, ?string $mime, string $cache): Response
    {
        $id = $this->safeId($ref);
        abort_unless($id, 404);

        $range = $request->header('Range');

        $upstream = $this->call(fn (PendingRequest $http) => $http
            ->timeout(120)
            ->withOptions(['stream' => true, 'decode_content' => false])
            ->withHeaders($range ? ['Range' => $range] : [])
            ->get(self::API."/{$id}", ['alt' => 'media']));

        $status = $upstream->status();

        abort_if($status === 404, 404);

        if ($status === 416) {
            return response('', 416, ['Content-Range' => $upstream->header('Content-Range')]);
        }

        abort_unless(in_array($status, [200, 206], true), 502, 'Storage is unavailable right now.');

        $headers = [
            'Content-Type' => $mime ?: ($upstream->header('Content-Type') ?: 'application/octet-stream'),
            'Cache-Control' => $cache,
            'X-Content-Type-Options' => 'nosniff',
            'Accept-Ranges' => 'bytes',
        ];

        foreach (['Content-Length', 'Content-Range'] as $name) {
            if ($value = $upstream->header($name)) {
                $headers[$name] = $value;
            }
        }

        $body = $upstream->toPsrResponse()->getBody();

        return response()->stream(function () use ($body) {
            while (! $body->eof()) {
                echo $body->read(65536);

                if (ob_get_level() > 0) {
                    @ob_flush();
                }
                flush();
            }

            $body->close();
        }, $status, $headers);
    }

    /** Used once by `media:drive-folder` to create the app's own folder. */
    public function createFolder(string $name): string
    {
        $response = $this->call(fn (PendingRequest $http) => $http->post(self::API.'?fields=id', [
            'name' => $name,
            'mimeType' => 'application/vnd.google-apps.folder',
        ]));

        if (! $response->successful() || ! $response->json('id')) {
            throw new RuntimeException('Could not create the folder: '.($response->json('error.message') ?? $response->status()));
        }

        return $response->json('id');
    }

    /** Get (or create once) a subfolder like "Memories" inside the app's root folder. */
    private function subfolder(string $folder): string
    {
        $root = $this->setting('folder_id');
        $name = Str::headline(explode('/', $folder)[0]);
        $key = 'media.drive.folder.'.md5($root.'|'.$name);

        return Cache::store('file')->rememberForever($key, function () use ($root, $name) {
            $q = "'{$root}' in parents and name = '".str_replace("'", "\\'", $name)."' "
                ."and mimeType = 'application/vnd.google-apps.folder' and trashed = false";

            $found = $this->call(fn (PendingRequest $http) => $http->get(self::API, [
                'q' => $q,
                'fields' => 'files(id)',
                'pageSize' => 1,
            ]));

            if ($found->successful() && ($id = $found->json('files.0.id'))) {
                return $id;
            }

            $created = $this->call(fn (PendingRequest $http) => $http->post(self::API.'?fields=id', [
                'name' => $name,
                'mimeType' => 'application/vnd.google-apps.folder',
                'parents' => [$root],
            ]));

            if (! $created->successful() || ! $created->json('id')) {
                throw new RuntimeException('Could not create the "'.$name.'" folder in Drive.');
            }

            return $created->json('id');
        });
    }
    // ---------- internals ----------

    /** Runs a request; if Google says the token is stale (401), refreshes it once and retries. */
    private function call(callable $request): HttpResponse
    {
        $response = $request($this->http());

        if ($response->status() === 401) {
            Cache::store('file')->forget(self::TOKEN_KEY);
            $response = $request($this->http());
        }

        return $response;
    }

    private function http(): PendingRequest
    {
        return Http::withToken($this->accessToken());
    }

    private function accessToken(): string
    {
        // File cache on purpose: works even if the cache table does not exist.
        return Cache::store('file')->remember(self::TOKEN_KEY, now()->addMinutes(50), function () {
            $response = Http::asForm()->post(self::TOKEN_URL, [
                'client_id' => $this->setting('client_id'),
                'client_secret' => $this->setting('client_secret'),
                'refresh_token' => $this->setting('refresh_token'),
                'grant_type' => 'refresh_token',
            ]);

            if (! $response->successful() || ! $response->json('access_token')) {
                Log::error('Google Drive token refresh failed', [
                    'status' => $response->status(),
                    'error' => $response->json('error'),
                ]);

                throw new RuntimeException(
                    'Could not get a Google Drive access token. Check the GOOGLE_DRIVE_* values in .env '
                    .'and that the OAuth app is published (apps left in "Testing" lose the token after 7 days).'
                );
            }

            return $response->json('access_token');
        });
    }

    private function setting(string $key): string
    {
        $value = config("media.drive.{$key}");

        if (blank($value)) {
            throw new RuntimeException('Google Drive is not configured: set GOOGLE_DRIVE_'.strtoupper($key).' in .env.');
        }

        return (string) $value;
    }

    /** Drive ids are URL-safe; anything else is rejected before it reaches a URL. */
    private function safeId(string $ref): ?string
    {
        return preg_match('/^[A-Za-z0-9_-]{10,}$/', $ref) ? $ref : null;
    }
}
