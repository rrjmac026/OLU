<?php

namespace App\Http\Controllers;

use App\Models\MemoryPhoto;
use App\Services\Media\MediaStorage;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MemoryPhotoController extends Controller
{
    /** Every image request is authorized: owner, or the memory is shared. */
    public function show(Request $request, MemoryPhoto $photo, MediaStorage $media): Response
    {
        abort_unless($photo->memory->canBeViewedBy($request->user()), 404);

        return $media->response($request, $photo->path, $photo->mime, 'private, max-age=3600');
    }
}
