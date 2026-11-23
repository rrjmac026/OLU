<?php

namespace App\Models;

use App\Services\WebPushService;
use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    protected $fillable = ['user_id', 'actor_id', 'type', 'title', 'body', 'url', 'read_at'];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        // Every notification created by Notifier also goes out as a web push.
        // Notifier already skips self-notifications and turned-off settings,
        // and only fills `body` when previews are allowed.
        static::created(function (AppNotification $notification) {
            $user = User::find($notification->user_id);

            if (! $user) {
                return;
            }

            $preview = $notification->body
                ? "{$notification->title}: {$notification->body}"
                : null;

            app(WebPushService::class)->sendToUser(
                $user,
                config('app.name'),
                $notification->title,     // safe text, always shown
                $preview,                 // only exists when previews are on
                $notification->url ?: '/',
                $notification->type,      // same type replaces the older push
            );
        });
    }
}