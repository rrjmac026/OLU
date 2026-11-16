<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Song;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'display_name' => $user->profile?->display_name,
                    'theme' => $user->settings?->theme ?? 'system',
                ] : null,
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            'playlist' => fn () => $request->user()
            ? Song::whereNotNull('audio_path')
                ->latest('id')
                ->get()
                ->map(fn (Song $s) => [
                    'id' => $s->id,
                    'title' => $s->title,
                    'artist' => $s->artist,
                    'audio_url' => '/storage/'.$s->audio_path,
                ])
                ->values()
            : [],
        ];
    }
}