<?php

namespace App\Console\Commands;

use App\Services\Media\GoogleDriveMediaDriver;
use Illuminate\Console\Command;

class DriveFolder extends Command
{
    protected $signature = 'media:drive-folder {name=Our Little Universe}';

    protected $description = 'Create the Google Drive folder this app stores its files in';

    public function handle(GoogleDriveMediaDriver $drive): int
    {
        $id = $drive->createFolder($this->argument('name'));

        $this->info('Folder created. Put this in .env:');
        $this->line('GOOGLE_DRIVE_FOLDER_ID='.$id);

        return self::SUCCESS;
    }
}
