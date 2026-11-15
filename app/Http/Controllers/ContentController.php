<?php

namespace App\Http\Controllers;

use App\Enums\ContentKind;
use App\Models\ContentItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    public function comfort(): Response
    {
        return Inertia::render('comfort/index');
    }

    public function random(Request $request, string $kind): JsonResponse
    {
        $kind = ContentKind::tryFrom($kind);
        abort_unless($kind, 404);

        $exclude = $request->query('exclude');

        return response()->json([
            'body' => ContentItem::randomBody($kind, is_string($exclude) ? $exclude : null),
        ]);
    }
}