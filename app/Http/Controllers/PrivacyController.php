<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePrivacyRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyController extends Controller
{
    public function edit(Request $request): Response
    {
        $privacy = $request->user()->privacy;

        $adminCanSee = [
            'Your account details (name, email)',
            'Content you explicitly choose to share',
            'Messages and notes sent between the two of you',
        ];

        if ($privacy->share_usage_summary) {
            $adminCanSee[] = 'A basic summary of which features you use';
        }

        return Inertia::render('settings/privacy', [
            'privacy' => [
                'share_usage_summary' => $privacy->share_usage_summary,
                'default_entry_visibility' => $privacy->default_entry_visibility->value,
            ],
            'visibility' => [
                'private_by_default' => [
                    'Diary entries',
                    'Mood details',
                    'Sleep logs',
                    'Dream journal',
                    'Personal notes',
                ],
                'admin_can_see' => $adminCanSee,
                'admin_cannot_see' => [
                    'Anything you keep private',
                    'Your password',
                ],
            ],
        ]);
    }

    public function update(UpdatePrivacyRequest $request): RedirectResponse
    {
        $request->user()->privacy->update($request->validated());

        return back()->with('status', 'Privacy settings saved.');
    }
}