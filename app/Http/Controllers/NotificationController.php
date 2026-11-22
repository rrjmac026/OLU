<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $items = AppNotification::where('user_id', $userId)
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn (AppNotification $n) => [
                'id' => $n->id,
                'type' => $n->type,
                'title' => $n->title,
                'body' => $n->body,
                'url' => $n->url,
                'read' => $n->read_at !== null,
                'created_at' => $n->created_at->toIso8601String(),
            ]);

        return response()->json([
            'unread' => AppNotification::where('user_id', $userId)->whereNull('read_at')->count(),
            'items' => $items,
        ]);
    }

    public function readAll(Request $request): Response
    {
        AppNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->noContent();
    }

    public function readOne(Request $request, int $id): Response
    {
        AppNotification::where('user_id', $request->user()->id)
            ->whereKey($id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->noContent();
    }

    /** Marks every unread notification of one type as read (used by the Home card badges). */
    public function readType(Request $request, string $type): Response
    {
        AppNotification::where('user_id', $request->user()->id)
            ->where('type', $type)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->noContent();
    }

    public function clear(Request $request): Response
    {
        AppNotification::where('user_id', $request->user()->id)->delete();

        return response()->noContent();
    }
}