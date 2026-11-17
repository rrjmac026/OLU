<?php

namespace App\Services\Media;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

/**
 * The one class controllers talk to.
 *
 * - New uploads go to the driver chosen by MEDIA_DRIVER (local | drive).
 * - The reference saved in the database says where a file lives:
 *       "drive:<fileId>"  -> Google Drive
 *       anything else     -> local disk
 *   so reads and deletes keep working for old files after you switch drivers.
 */
class MediaStorage
{
    private const DRIVE_PREFIX = 'drive:';

    public function __construct(
        private LocalMediaDriver $local,
        private GoogleDriveMediaDriver $drive,
    ) {}

    /** @return string the reference to store in the database */
    public function put(UploadedFile $file, string $folder): string
    {
        $mime = $file->getMimeType() ?: 'application/octet-stream';

        if (config('media.driver') === 'drive') {
            return self::DRIVE_PREFIX.$this->drive->putFromPath($file->getRealPath(), $mime, $folder);
        }

        return $this->local->putFromPath($file->getRealPath(), $mime, $folder);
    }

    public function delete(?string $ref): void
    {
        if (blank($ref)) {
            return;
        }

        [$driver, $id] = $this->resolve($ref);
        $driver->delete($id);
    }

    public function response(Request $request, ?string $ref, ?string $mime = null, string $cache = 'private, max-age=3600'): Response
    {
        abort_if(blank($ref), 404);

        [$driver, $id] = $this->resolve($ref);

        return $driver->response($request, $id, $mime, $cache);
    }

    /** @return array{0: MediaDriver, 1: string} */
    private function resolve(string $ref): array
    {
        if (str_starts_with($ref, self::DRIVE_PREFIX)) {
            return [$this->drive, substr($ref, strlen(self::DRIVE_PREFIX))];
        }

        return [$this->local, $ref];
    }
}
