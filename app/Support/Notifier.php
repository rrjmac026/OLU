<?php

namespace App\Support;

use App\Models\AppNotification;
use App\Models\User;
use Illuminate\Support\Str;

class Notifier
{
    /** The other active person (this app assumes exactly two accounts). */
    public static function partnerOf(User $actor): ?User
    {
        return User::where('id', '!=', $actor->id)->where('is_active', true)->first();
    }

    public static function send(
        ?User $actor,
        ?User $to,
        string $type,
        string $text,
        ?string $preview = null,
        ?string $url = null,
    ): void {
        if (! $actor || ! $to || $to->id === $actor->id) {
            return;
        }

        $settings = $to->settings;

        // She (or you) turned notifications off in Settings.
        if ($settings && ! $settings->notifications_enabled) {
            return;
        }

        $name = $actor->profile?->display_name ?: $actor->name;

        AppNotification::create([
            'user_id' => $to->id,
            'actor_id' => $actor->id,
            'type' => $type,
            'title' => "{$name} {$text}",
            // Previews are off by default, so the detail is only stored when allowed.
            'body' => ($settings?->notification_previews && $preview) ? Str::limit($preview, 120) : null,
            'url' => $url,
        ]);

        // Keep the table small: drop this person's notifications older than 30 days.
        AppNotification::where('user_id', $to->id)
            ->where('created_at', '<', now()->subDays(30))
            ->delete();
    }
}