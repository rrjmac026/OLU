<?php

namespace App\Services\Media;

use Illuminate\Http\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

/** Development: files live on the private local disk (storage/app/private). */
class LocalMediaDriver implements MediaDriver
{
    public function putFromPath(string $absolutePath, string $mime, string $folder): string
    {
        $path = Storage::disk('local')->putFile($folder, new File($absolutePath));

        if ($path === false) {
            throw new RuntimeException('Could not store the file on the local disk.');
        }

        return $path;
    }

    public function delete(string $ref): void
    {
        Storage::disk('local')->delete($ref);
        Storage::disk('public')->delete($ref); // legacy: songs used to be saved on the public disk
    }

    public function response(Request $request, string $ref, ?string $mime, string $cache): Response
    {
        $path = $this->locate($ref);
        abort_unless($path, 404);

        $headers = [
            'Cache-Control' => $cache,
            'X-Content-Type-Options' => 'nosniff',
        ];

        if ($mime) {
            $headers['Content-Type'] = $mime;
        }

        // BinaryFileResponse answers Range requests by itself (audio seeking works).
        return response()->file($path, $headers);
    }

    /** Absolute path of a stored file, or null. Also checks the legacy public disk. */
    public function locate(string $ref): ?string
    {
        foreach (['local', 'public'] as $disk) {
            $path = Storage::disk($disk)->path($ref);

            if (is_file($path)) {
                return $path;
            }
        }

        return null;
    }
}
