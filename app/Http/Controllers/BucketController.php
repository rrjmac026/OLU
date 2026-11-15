<?php

namespace App\Http\Controllers;

use App\Http\Requests\BucketItemRequest;
use App\Models\BucketItem;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BucketController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $items = BucketItem::with('owner.profile')
            ->orderBy('is_done')
            ->orderByDesc('id')
            ->get()
            ->map(fn (BucketItem $i) => $this->payload($i, $user));

        return Inertia::render('bucket/index', ['items' => $items]);
    }

    public function store(BucketItemRequest $request): RedirectResponse
    {
        $data = $request->validated();

        BucketItem::create([
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'category' => $data['category'],
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('status', 'Added to the bucket list.');
    }

    /** Either of you can tick an item done (or undo it). */
    public function toggle(BucketItem $item): RedirectResponse
    {
        $done = ! $item->is_done;

        $item->update([
            'is_done' => $done,
            'done_at' => $done ? now() : null,
        ]);

        return back();
    }

    public function destroy(Request $request, BucketItem $item): RedirectResponse
    {
        abort_unless($item->user_id === $request->user()->id, 404);

        $item->delete();

        return back()->with('status', 'Removed.');
    }

    private function payload(BucketItem $i, User $viewer): array
    {
        return [
            'id' => $i->id,
            'title' => $i->title,
            'category' => $i->category->value,
            'note' => $i->note,
            'is_done' => $i->is_done,
            'done_label' => $i->done_at?->format('M j, Y'),
            'is_mine' => $i->user_id === $viewer->id,
            'added_by' => $i->owner->profile?->display_name ?: $i->owner->name,
        ];
    }
}