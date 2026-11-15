<?php

namespace App\Http\Controllers;

use App\Http\Requests\MemoryRequest;
use App\Models\Memory;
use App\Models\TimelineMoment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MemoryController extends Controller
{
    private const MAX_PHOTOS = 6;

    public function index(Request $request): Response
    {
        $user = $request->user();

        $memories = Memory::with(['owner.profile', 'photos', 'moment'])
            ->visibleTo($user)
            ->orderByDesc('taken_on')
            ->orderByDesc('id')
            ->limit(200)
            ->get()
            ->map(fn (Memory $m) => $this->payload($m, $user));

        return Inertia::render('memories/index', ['memories' => $memories]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('memories/create', [
            'moments' => $this->momentOptions($user),
            'default_visibility' => $user->privacy?->default_entry_visibility?->value ?? 'private',
        ]);
    }

    public function store(MemoryRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $files = $request->file('photos', []);

        if (blank($data['caption'] ?? null) && count($files) === 0) {
            throw ValidationException::withMessages(['caption' => 'Add a caption or at least one photo.']);
        }

        $memory = Memory::create([
            'user_id' => $user->id,
            'timeline_moment_id' => $this->momentId($user, $data['timeline_moment_id'] ?? null),
            'caption' => $data['caption'] ?? null,
            'taken_on' => $data['taken_on'] ?? null,
            'visibility' => $data['visibility'],
        ]);

        $this->attachPhotos($memory, $files);

        return redirect("/memories/{$memory->id}")->with('status', 'Memory saved.');
    }

    public function show(Request $request, Memory $memory): Response
    {
        $user = $request->user();
        abort_unless($memory->canBeViewedBy($user), 404);

        return Inertia::render('memories/show', [
            'memory' => $this->payload($memory->load(['owner.profile', 'photos', 'moment']), $user),
        ]);
    }

    public function edit(Request $request, Memory $memory): Response
    {
        $user = $request->user();
        $memory = $this->ownedOrFail($request, $memory);

        return Inertia::render('memories/edit', [
            'memory' => $this->payload($memory->load(['owner.profile', 'photos', 'moment']), $user),
            'moments' => $this->momentOptions($user),
            'default_visibility' => 'private',
        ]);
    }

    public function update(MemoryRequest $request, Memory $memory): RedirectResponse
    {
        $user = $request->user();
        $memory = $this->ownedOrFail($request, $memory);
        $data = $request->validated();

        $removing = $memory->photos()->whereIn('id', $data['remove_photos'] ?? [])->get();
        $files = $request->file('photos', []);
        $remaining = $memory->photos()->count() - $removing->count();

        if ($remaining + count($files) > self::MAX_PHOTOS) {
            throw ValidationException::withMessages(['photos' => 'A memory can have up to 6 photos.']);
        }

        if (blank($data['caption'] ?? null) && $remaining + count($files) === 0) {
            throw ValidationException::withMessages(['caption' => 'Add a caption or at least one photo.']);
        }

        $memory->update([
            'timeline_moment_id' => $this->momentId($user, $data['timeline_moment_id'] ?? null),
            'caption' => $data['caption'] ?? null,
            'taken_on' => $data['taken_on'] ?? null,
            'visibility' => $data['visibility'],
        ]);

        foreach ($removing as $photo) {
            Storage::disk('local')->delete($photo->path);
            $photo->delete();
        }

        $this->attachPhotos($memory, $files);

        return redirect("/memories/{$memory->id}")->with('status', 'Memory updated.');
    }

    public function destroy(Request $request, Memory $memory): RedirectResponse
    {
        $memory = $this->ownedOrFail($request, $memory);

        foreach ($memory->photos as $photo) {
            Storage::disk('local')->delete($photo->path);
        }

        $memory->delete(); // photo rows cascade

        return redirect('/memories')->with('status', 'Memory deleted.');
    }

    // ---------- helpers ----------

    private function ownedOrFail(Request $request, Memory $memory): Memory
    {
        abort_unless($memory->isOwnedBy($request->user()), 404);

        return $memory;
    }

    /** @param  array<int, \Illuminate\Http\UploadedFile>  $files */
    private function attachPhotos(Memory $memory, array $files): void
    {
        foreach ($files as $file) {
            $mime = $file->getMimeType();
            $size = $file->getSize();
            $path = $file->store("memories/{$memory->user_id}", 'local');

            $memory->photos()->create(['path' => $path, 'mime' => $mime, 'size' => $size]);
        }
    }

    private function momentId(User $user, $id): ?int
    {
        if (! $id) {
            return null;
        }

        $ok = TimelineMoment::visibleTo($user)->whereKey($id)->exists();

        if (! $ok) {
            throw ValidationException::withMessages(['timeline_moment_id' => 'Pick a moment from your timeline.']);
        }

        return (int) $id;
    }

    private function momentOptions(User $user): array
    {
        return TimelineMoment::visibleTo($user)
            ->latest('id')
            ->get()
            ->map(fn ($m) => ['id' => $m->id, 'title' => $m->title])
            ->values()
            ->all();
    }

    private function payload(Memory $m, User $viewer): array
    {
        $isOwner = $m->isOwnedBy($viewer);

        return [
            'id' => $m->id,
            'caption' => $m->caption,
            'taken_label' => $m->taken_on?->format('M j, Y'),
            'taken_input' => $m->taken_on?->format('Y-m-d'),
            'visibility' => $m->visibility->value,
            'is_owner' => $isOwner,
            'owner_name' => $m->owner->profile?->display_name ?: $m->owner->name,
            'photos' => $m->photos->map(fn ($p) => ['id' => $p->id])->values()->all(),
            // Only the owner sees the timeline link, so a private moment's title never leaks.
            'moment' => ($isOwner && $m->moment) ? ['id' => $m->moment->id, 'title' => $m->moment->title] : null,
            'timeline_moment_id' => $isOwner ? $m->timeline_moment_id : null,
        ];
    }
}