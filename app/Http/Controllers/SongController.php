<?php

namespace App\Http\Controllers;

use App\Http\Requests\SongRequest;
use App\Models\Song;
use App\Models\User;
use App\Services\Media\MediaStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SongController extends Controller
{
    public function __construct(private MediaStorage $media) {}

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
            ? $this->media->put($request->file('audio'), 'songs')
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

    /** Streams the audio (Range-aware, so the player can seek). Songs are shared by nature: any logged-in user. */
    public function audio(Request $request, Song $song): SymfonyResponse
    {
        abort_unless($song->audio_path, 404);

        return $this->media->response($request, $song->audio_path, null, 'private, max-age=3600');
    }

    public function destroy(Request $request, Song $song): RedirectResponse
    {
        abort_unless($song->user_id === $request->user()->id, 404);

        $this->media->delete($song->audio_path);
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
            'audio_url' => $s->audio_path ? "/music/{$s->id}/audio" : null,
            'note' => $s->note,
            'is_mine' => $s->user_id === $viewer->id,
            'added_by' => $s->owner->profile?->display_name ?: $s->owner->name,
        ];
    }
}
