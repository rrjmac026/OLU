<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentKind;
use App\Http\Controllers\Controller;
use App\Models\ContentItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    public function index(Request $request): Response
    {
        $kind = ContentKind::tryFrom((string) $request->query('kind')) ?? ContentKind::Question;

        $counts = [];
        foreach (ContentKind::cases() as $k) {
            $counts[$k->value] = ContentItem::ofKind($k)->count();
        }

        return Inertia::render('admin/content', [
            'kind' => $kind->value,
            'counts' => $counts,
            'items' => ContentItem::ofKind($kind)
                ->orderByDesc('id')
                ->get(['id', 'body', 'is_active'])
                ->map(fn ($i) => ['id' => $i->id, 'body' => $i->body, 'is_active' => $i->is_active])
                ->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'kind' => ['required', Rule::enum(ContentKind::class)],
            'body' => ['required', 'string', 'max:500'],
        ]);

        ContentItem::create($data);

        return redirect('/admin/content?kind=' . $data['kind'])->with('status', 'Added.');
    }

    public function update(Request $request, ContentItem $item): RedirectResponse
    {
        $data = $request->validate([
            'body' => ['sometimes', 'required', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $item->update($data);

        return back();
    }

    public function destroy(ContentItem $item): RedirectResponse
    {
        $item->delete();

        return back()->with('status', 'Deleted.');
    }
}