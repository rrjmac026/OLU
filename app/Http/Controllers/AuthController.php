<?php

namespace App\Http\Controllers;

use App\Enums\ActivityAction;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return redirect()->route('home');
        }

        return Inertia::render('auth/login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $key = Str::lower($data['email']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            // LOG
            ActivityLogger::log(ActivityAction::LoginFailed, 'login blocked (too many attempts)', null, [
                'email' => $data['email'],
            ]);

            throw ValidationException::withMessages([
                'email' => 'Too many attempts. Try again in '.RateLimiter::availableIn($key).' seconds.',
            ]);
        }

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            RateLimiter::hit($key, 60);

            // LOG
            ActivityLogger::log(ActivityAction::LoginFailed, 'failed login attempt', null, [
                'email' => $data['email'],
            ]);

            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        if (! $user->is_active) {
            // LOG
            ActivityLogger::log(ActivityAction::LoginFailed, 'login to disabled account', $user, user: $user);

            throw ValidationException::withMessages([
                'email' => 'This account is disabled.',
            ]);
        }

        RateLimiter::clear($key);

        $request->session()->regenerate();
        $request->session()->put('auth_user_id', $user->id);
        $request->session()->put('auth_stamp', $user->authStamp());

        $user->forceFill(['last_login_at' => now()])->save();

        // LOG
        ActivityLogger::log(ActivityAction::Login, 'logged in', $user, user: $user);

        return redirect()->route('home');
    }

    public function destroy(Request $request): RedirectResponse
    {
        // LOG: must run BEFORE invalidate(), or the session user is gone
        ActivityLogger::log(ActivityAction::Logout, 'logged out');

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}