<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class DriveAuthorize extends Command
{
    protected $signature = 'media:drive-authorize';

    protected $description = 'One-time: get the Google Drive refresh token for your .env';

    public function handle(): int
    {
        $clientId = config('media.drive.client_id');
        $clientSecret = config('media.drive.client_secret');

        if (blank($clientId) || blank($clientSecret)) {
            $this->error('Set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET in .env first (then php artisan config:clear).');

            return self::FAILURE;
        }

        $redirect = 'http://localhost';

        $url = 'https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirect,
            'response_type' => 'code',
            'scope' => 'https://www.googleapis.com/auth/drive.file',
            'access_type' => 'offline',
            'prompt' => 'consent',
        ]);

        $this->line('');
        $this->line('1. Open this link, sign in with the Google account that should own the files, and allow access:');
        $this->line('');
        $this->line($url);
        $this->line('');
        $this->line('2. Your browser will then land on a page that fails to load (http://localhost/?code=...). That is expected.');
        $this->line('   Copy the WHOLE address from the address bar and paste it below.');
        $this->line('');

        $input = trim((string) $this->ask('Paste the address (or just the code)'));

        $code = $input;
        if (str_contains($input, 'code=')) {
            parse_str((string) parse_url($input, PHP_URL_QUERY), $query);
            $code = $query['code'] ?? '';
        }

        if ($code === '') {
            $this->error('No code found in what you pasted.');

            return self::FAILURE;
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => $redirect,
        ]);

        $refresh = $response->json('refresh_token');

        if (! $response->successful() || ! $refresh) {
            $this->error('Google did not return a refresh token: '.($response->json('error_description') ?? $response->json('error') ?? $response->status()));
            $this->line('Codes work once and expire fast. Run this command again for a fresh link.');

            return self::FAILURE;
        }

        $this->info('Add this to your .env:');
        $this->line('');
        $this->line("GOOGLE_DRIVE_REFRESH_TOKEN={$refresh}");
        $this->line('');
        $this->line('Treat it like a password.');

        return self::SUCCESS;
    }
}
