<?php

namespace App\Services;

use App\Enums\ActivityAction;
use App\Events\ActivityLogged;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Throwable;

class ActivityLogger
{
    public static function log(
        ActivityAction $action,
        string $description,
        ?Model $subject = null,
        array $properties = [],
        ?User $user = null,
    ): void {
        try {
            $console = app()->runningInConsole();
            $request = $console ? null : request();
            $user ??= self::currentUser($console);

            ActivityLog::create([
                'user_id' => $user?->id,
                'action' => $action,
                'subject_type' => $subject ? class_basename($subject) : null,
                'subject_id' => $subject?->getKey(),
                'description' => $description,
                'properties' => $properties ?: null,
                'ip_address' => $request?->ip(),
                'user_agent' => $request ? substr((string) $request->userAgent(), 0, 255) : null,
            ]);

            try {
                broadcast(new ActivityLogged());
            } catch (Throwable $e) {
                report($e); // Reverb down? the log is still saved
            }
        } catch (Throwable $e) {
            report($e); // logging must never break a request
        }
    }

    private static function currentUser(bool $console): ?User
    {
        if ($console) {
            return null;
        }

        $id = session('auth_user_id');

        return $id ? User::find($id) : null;
    }
}