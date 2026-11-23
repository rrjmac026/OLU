<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class WebPushGenerateKeys extends Command
{
    protected $signature = 'webpush:keys';

    protected $description = 'Generate VAPID keys for Web Push notifications';

    public function handle(): int
    {
        $keys = VAPID::createVapidKeys();

        $this->line('Add these to your .env (and to your Render environment variables):');
        $this->newLine();
        $this->line('VAPID_PUBLIC_KEY='.$keys['publicKey']);
        $this->line('VAPID_PRIVATE_KEY='.$keys['privateKey']);
        $this->line('VAPID_SUBJECT=mailto:you@example.com');
        $this->newLine();
        $this->warn('Generate these once and keep them. Changing the keys later invalidates every saved subscription.');

        return self::SUCCESS;
    }
}