<?php

namespace App\Http\Controllers;

use App\Http\Requests\WheelItemRequest;
use App\Models\WheelItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WheelController extends Controller
{
    public function index(Request $request): Response
    {
        $items = WheelItem::where('is_active', true)
            ->orderBy('id')
            ->get()
            ->map(fn (WheelItem $i) => [
                'id' => $i->id,
                'category' => $i->category->value,
                'label' => $i->label,
            ]);

        // The full list (including hidden items) is only sent to the admin.
        $manage = $request->user()->isAdmin()
            ? WheelItem::orderByDesc('id')->get()->map(fn (WheelItem $i) => [
                'id' => $i->id,
                'category' => $i->category->value,
                'label' => $i->label,
                'is_active' => $i->is_active,
            ])
            : null;

        return Inertia::render('wheel/index', [
            'items' => $items,
            'manage' => $manage,
        ]);
    }

    public function store(WheelItemRequest $request): RedirectResponse
    {
        WheelItem::create($request->validated());

        return back()->with('status', 'Added to the wheel.');
    }

    public function toggle(WheelItem $item): RedirectResponse
    {
        $item->update(['is_active' => ! $item->is_active]);

        return back();
    }

    public function destroy(WheelItem $item): RedirectResponse
    {
        $item->delete();

        return back()->with('status', 'Removed from the wheel.');
    }
}