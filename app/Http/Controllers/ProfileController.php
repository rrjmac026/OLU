<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $profile = $request->user()->profile;

        return Inertia::render('settings/profile', [
            'profile' => [
                'display_name' => $profile->display_name,
                'nickname' => $profile->nickname,
                'birthday' => $profile->birthday?->toDateString(),
                'bio' => $profile->bio,
                'timezone' => $profile->timezone,
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $request->user()->profile->update($request->validated());

        return back()->with('status', 'Profile saved.');
    }
}