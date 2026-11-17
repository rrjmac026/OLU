<?php

namespace App\Console\Commands;

use App\Services\Media\GoogleDriveMediaDriver;
use Illuminate\Console\Command;

class DriveCreateFolder extends Command
{
    protected $signature = 'media:drive-folder {name?}';

    protected $description = 'One-time: create the private Drive folder that will hold all uploads';

    public function handle(GoogleDriveMediaDriver $drive): int
    {
        $id = $drive->createFolder($this->argument('name') ?: 'Our Little Universe');

        $this->info('Folder created. Add this to your .env:');
        $this->line('');
        $this->line("GOOGLE_DRIVE_FOLDER_ID={$id}");

        return self::SUCCESS;
    }
}
