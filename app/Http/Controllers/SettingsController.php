<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $settings = $request->user()->settings;

        return Inertia::render('settings/preferences', [
            'settings' => [
                'theme' => $settings->theme,
                'notifications_enabled' => $settings->notifications_enabled,
                'notification_previews' => $settings->notification_previews,
                'gamification_enabled' => $settings->gamification_enabled,
            ],
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $request->user()->settings->update($request->validated());

        return back()->with('status', 'Preferences saved.');
    }
}