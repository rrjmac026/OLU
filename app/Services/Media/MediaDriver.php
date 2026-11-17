<?php

namespace App\Services\Media;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

interface MediaDriver
{
    /** Store a file that already exists on disk. Returns the driver's own reference. */
    public function putFromPath(string $absolutePath, string $mime, string $folder): string;

    /** Remove a stored file. Never throws if it is already gone. */
    public function delete(string $ref): void;

    /** Authorized-by-the-caller response that streams the file (with Range support). */
    public function response(Request $request, string $ref, ?string $mime, string $cache): Response;
}
