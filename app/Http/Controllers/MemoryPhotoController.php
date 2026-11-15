<?php

namespace App\Http\Controllers;

use App\Models\MemoryPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MemoryPhotoController extends Controller
{
    /** Every image request is authorized: owner, or the memory is shared. */
    public function show(Request $request, MemoryPhoto $photo): BinaryFileResponse
    {
        abort_unless($photo->memory->canBeViewedBy($request->user()), 404);

        $path = Storage::disk('local')->path($photo->path);
        abort_unless(is_file($path), 404);

        return response()->file($path, [
            'Content-Type' => $photo->mime,
            'Cache-Control' => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}