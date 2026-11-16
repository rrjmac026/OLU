<?php

namespace App\Http\Controllers;

use App\Models\UserAchievement;
use App\Support\Achievements;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();
        $enabled = (bool) ($me->settings?->gamification_enabled ?? true);

        if (! $enabled) {
            return Inertia::render('achievements/index', [
                'enabled' => false,
                'items' => [],
            ]);
        }

        Achievements::sync($me);

        $unlocked = UserAchievement::where('user_id', $me->id)->get()->keyBy('key');

        $items = collect(Achievements::ALL)->map(fn (array $a, string $key) => [
            'key' => $key,
            'emoji' => $a['emoji'],
            'title' => $a['title'],
            'description' => $a['description'],
            'unlocked_at' => $unlocked->get($key)?->unlocked_at?->toIso8601String(),
        ])->values();

        return Inertia::render('achievements/index', [
            'enabled' => true,
            'items' => $items,
        ]);
    }
}