<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveSessionUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasSession() && $id = $request->session()->get('auth_user_id')) {
            $user = User::with(['profile', 'settings'])->find($id);

            $valid = $user
                && $user->is_active
                && hash_equals($user->authStamp(), (string) $request->session()->get('auth_stamp'));

            if ($valid) {
                $request->setUserResolver(fn () => $user);
            } else {
                $request->session()->forget(['auth_user_id', 'auth_stamp']);
            }
        }

        return $next($request);
    }
}