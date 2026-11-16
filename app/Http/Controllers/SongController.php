<?php

namespace App\Http\Controllers;

use App\Http\Requests\SongRequest;
use App\Models\Song;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SongController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $songs = Song::with('owner.profile')
            ->latest('id')
            ->get()
            ->map(fn (Song $s) => $this->payload($s, $user));

        return Inertia::render('music/index', ['songs' => $songs]);
    }

    public function store(SongRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $audioPath = $request->hasFile('audio')
            ? $request->file('audio')->store('songs', 'public')
            : null;

        Song::create([
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'artist' => $data['artist'] ?? null,
            'link' => $data['link'] ?? null,
            'audio_path' => $audioPath,
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('status', 'Song added.');
    }

    public function destroy(Request $request, Song $song): RedirectResponse
    {
        abort_unless($song->user_id === $request->user()->id, 404);

        if ($song->audio_path) {
            Storage::disk('public')->delete($song->audio_path);
        }
        $song->delete();

        return back()->with('status', 'Song removed.');
    }

    private function payload(Song $s, User $viewer): array
    {
        return [
            'id' => $s->id,
            'title' => $s->title,
            'artist' => $s->artist,
            'link' => $s->link,
            'audio_url' => $s->audio_path ? '/storage/'.$s->audio_path : null,
            'note' => $s->note,
            'is_mine' => $s->user_id === $viewer->id,
            'added_by' => $s->owner->profile?->display_name ?: $s->owner->name,
        ];
    }
}