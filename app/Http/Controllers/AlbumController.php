<?php

namespace App\Http\Controllers;

use App\Http\Requests\AlbumRequest;
use App\Models\Album;
use App\Models\AlbumSlide;
use App\Models\MemoryPhoto;
use App\Models\Song;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AlbumController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $albums = Album::visibleTo($user)
            ->with(['slides.song', 'defaultSong'])
            ->latest()
            ->get()
            ->map(fn (Album $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'description' => $a->description,
                'theme' => $a->theme,
                'is_published' => $a->is_published,
                'date_label' => $a->created_at->format('M Y'),
                'slides' => $a->slides->map(fn (AlbumSlide $s) => [
                    'id' => $s->id,
                    'url' => "/memories/photos/{$s->memory_photo_id}",
                    'caption' => $s->caption,
                    'duration' => $s->duration,
                    'caption_position' => $s->caption_position,
                    'filter' => $s->filter,
                    'transition' => $s->transition,
                    'song' => $this->songBlock($a, $s),
                ])->values(),
            ]);

        return Inertia::render('albums/index', [
            'albums' => $albums,
            'can_manage' => $user->isAdmin(),
        ]);
    }

    /** The slide's own song (with its own clip), otherwise the album song (with the album clip). */
    private function songBlock(Album $album, AlbumSlide $slide): ?array
    {
        $own = $slide->song;
        $song = $own ?? $album->defaultSong;

        if (! $song) {
            return null;
        }

        [$start, $end] = $own
            ? [$slide->song_start, $slide->song_end]
            : [$album->default_song_start, $album->default_song_end];

        return [
            'id' => $song->id,
            'title' => $song->title,
            'artist' => $song->artist,
            'audio_url' => filled($song->audio_path) ? "/music/{$song->id}/audio" : null,
            'start' => $start,
            'end' => $end,
        ];
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        $photos = MemoryPhoto::query()
            ->whereHas('memory', fn ($q) => $q->visibleTo($user))
            ->with('memory:id,caption,taken_on')
            ->latest('id')
            ->limit(300)
            ->get()
            ->map(fn (MemoryPhoto $p) => [
                'id' => $p->id,
                'url' => "/memories/photos/{$p->id}",
                'caption' => $p->memory?->caption,
                'date' => $p->memory?->taken_on?->format('M j, Y'),
            ]);

        $songs = Song::latest()->get()->map(fn (Song $s) => [
            'id' => $s->id,
            'title' => $s->title,
            'artist' => $s->artist,
            'playable' => filled($s->audio_path),
            'audio_url' => filled($s->audio_path) ? "/music/{$s->id}/audio" : null,
        ]);

        return Inertia::render('albums/create', [
            'photos' => $photos,
            'songs' => $songs,
        ]);
    }

    public function store(AlbumRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $data) {
            $hasDefault = ! empty($data['default_song_id']);

            $album = Album::create([
                'user_id' => $request->user()->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'theme' => $data['theme'],
                'default_song_id' => $data['default_song_id'] ?? null,
                'default_song_start' => $hasDefault ? ($data['default_song_start'] ?? null) : null,
                'default_song_end' => $hasDefault ? ($data['default_song_end'] ?? null) : null,
            ]);

            foreach ($data['slides'] as $i => $s) {
                $hasSong = ! empty($s['song_id']);

                $album->slides()->create([
                    'memory_photo_id' => $s['memory_photo_id'],
                    'song_id' => $s['song_id'] ?? null,
                    'song_start' => $hasSong ? ($s['song_start'] ?? null) : null,
                    'song_end' => $hasSong ? ($s['song_end'] ?? null) : null,
                    'caption' => $s['caption'] ?? null,
                    'duration' => $s['duration'],
                    'caption_position' => $s['caption_position'],
                    'filter' => $s['filter'],
                    'transition' => $s['transition'],
                    'position' => $i,
                ]);
            }
        });

        return redirect('/albums')->with('status', 'Album created as a draft.');
    }

    public function togglePublish(Album $album): RedirectResponse
    {
        $album->update(['is_published' => ! $album->is_published]);

        return back()->with('status', $album->is_published ? 'Album published.' : 'Album hidden.');
    }

    public function destroy(Album $album): RedirectResponse
    {
        $album->delete();

        return back()->with('status', 'Album deleted.');
    }
}