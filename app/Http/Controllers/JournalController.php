<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJournalEntryRequest;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $tab = in_array($request->query('tab'), ['diary', 'dream', 'shared'], true)
            ? $request->query('tab')
            : 'all';

        $query = $tab === 'shared'
            ? JournalEntry::sharedWith($user)->with('user.profile')
            : JournalEntry::ownedBy($user)->when($tab !== 'all', fn ($q) => $q->where('type', $tab));

        $entries = $query
            ->orderByDesc('entry_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (JournalEntry $entry) => $this->payload($entry, $user, false));

        return Inertia::render('journal/index', [
            'entries' => $entries,
            'tab' => $tab,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('journal/create', [
            'default_visibility' => $user->privacy->default_entry_visibility->value,
            'today' => JournalEntry::todayFor($user),
        ]);
    }

    public function store(StoreJournalEntryRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $entry = JournalEntry::create([
            ...$data,
            'user_id' => $user->id,
            'visibility' => $data['visibility'] ?? $user->privacy->default_entry_visibility->value,
        ]);

        return redirect()->route('journal.show', $entry)->with('status', 'Entry saved.');
    }

    public function show(Request $request, JournalEntry $entry): Response
    {
        $user = $request->user();

        abort_unless($entry->canBeViewedBy($user), 404);

        $entry->loadMissing('user.profile');

        return Inertia::render('journal/show', [
            'entry' => $this->payload($entry, $user, true),
        ]);
    }

    public function edit(Request $request, JournalEntry $entry): Response
    {
        $this->ownedOrFail($request, $entry);

        return Inertia::render('journal/edit', [
            'entry' => $this->payload($entry, $request->user(), true),
        ]);
    }

    public function update(StoreJournalEntryRequest $request, JournalEntry $entry): RedirectResponse
    {
        $this->ownedOrFail($request, $entry);

        $entry->update($request->validated());

        return redirect()->route('journal.show', $entry)->with('status', 'Entry updated.');
    }

    public function destroy(Request $request, JournalEntry $entry): RedirectResponse
    {
        $this->ownedOrFail($request, $entry);

        $entry->delete();

        return redirect()->route('journal.index')->with('status', 'Entry deleted.');
    }

    /**
     * Anyone who is not the owner gets a 404, so existence is never revealed.
     */
    private function ownedOrFail(Request $request, JournalEntry $entry): void
    {
        abort_unless($entry->user_id === $request->user()->id, 404);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(JournalEntry $entry, User $viewer, bool $full): array
    {
        $own = $entry->user_id === $viewer->id;

        $data = [
            'id' => $entry->id,
            'type' => $entry->type->value,
            'title' => $entry->title,
            'date' => $entry->entry_date->toDateString(),
            'visibility' => $entry->visibility->value,
            'is_own' => $own,
            'author' => $own ? null : ($entry->user->profile?->display_name ?? $entry->user->name),
        ];

        return $full
            ? [...$data, 'body' => $entry->body]
            : [...$data, 'snippet' => Str::limit($entry->body, 160)];
    }
}