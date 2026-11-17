<?php

namespace App\Console\Commands;

use App\Models\Background;
use App\Models\MemoryPhoto;
use App\Models\Song;
use App\Services\Media\GoogleDriveMediaDriver;
use App\Services\Media\LocalMediaDriver;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MoveMediaToDrive extends Command
{
    protected $signature = 'media:move-to-drive
                            {--dry-run : Only show what would be moved}
                            {--keep-local : Keep the local copy after uploading}';

    protected $description = 'Upload existing local photos, backgrounds and songs to Google Drive and update their references';

    public function handle(LocalMediaDriver $local, GoogleDriveMediaDriver $drive): int
    {
        $dry = (bool) $this->option('dry-run');
        $keep = (bool) $this->option('keep-local');

        $targets = [
            // model, column, name prefix in Drive, has a `mime` column
            [MemoryPhoto::class, 'path', 'memories', true],
            [Background::class, 'path', 'backgrounds', true],
            [Song::class, 'audio_path', 'songs', false],
        ];

        $moved = 0;
        $missing = 0;

        foreach ($targets as [$model, $column, $folder, $hasMime]) {
            $this->line("Checking {$folder}...");

            // chunkById keeps working while the rows we update stop matching the filter.
            $model::query()
                ->whereNotNull($column)
                ->where($column, 'not like', 'drive:%')
                ->chunkById(50, function ($rows) use ($local, $drive, $column, $folder, $hasMime, $dry, $keep, &$moved, &$missing) {
                    foreach ($rows as $row) {
                        $ref = $row->{$column};
                        $path = $local->locate($ref);

                        if (! $path) {
                            $this->warn("  missing on disk: {$ref}");
                            $missing++;

                            continue;
                        }

                        if ($dry) {
                            $this->line("  would move: {$ref}");
                            $moved++;

                            continue;
                        }

                        $mime = ($hasMime ? $row->mime : null) ?: (mime_content_type($path) ?: 'application/octet-stream');

                        $id = $drive->putFromPath($path, $mime, $folder);

                        $row->{$column} = 'drive:'.$id;
                        $row->save();

                        if (! $keep) {
                            Storage::disk('local')->delete($ref);
                            Storage::disk('public')->delete($ref);
                        }

                        $this->line("  moved: {$ref}");
                        $moved++;
                    }
                });
        }

        $this->info(($dry ? 'Would move' : 'Moved')." {$moved} file(s). Missing on disk: {$missing}.");

        return self::SUCCESS;
    }
}
