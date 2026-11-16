<?php

namespace App\Http\Controllers;

use App\Enums\Visibility;
use App\Http\Requests\StoreCheckinRequest;
use App\Models\DailyCheckin;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckinController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = DailyCheckin::todayFor($user);

        $entries = DailyCheckin::ownedBy($user)
            ->orderByDesc('checkin_date')
            ->limit(60)
            ->get()
            ->map(fn (DailyCheckin $c) => $this->present($c));

        $partner = $this->partnerFor($user);

        $partnerEntries = $partner
            ? DailyCheckin::query()
                ->where('user_id', $partner->id)
                ->where('visibility', Visibility::Shared->value)
                ->orderByDesc('checkin_date')
                ->limit(30)
                ->get()
                ->map(fn (DailyCheckin $c) => $this->present($c))
            : collect();

        return Inertia::render('checkins/index', [
            'today' => $entries->firstWhere('date', $today),
            'history' => $entries->values(),
            'default_visibility' => $user->privacy->default_entry_visibility->value,
            'partner' => $partner ? ['name' => $partner->display_name ?? $partner->name] : null,
            'partner_history' => $partnerEntries->values(),
        ]);
    }

    public function store(StoreCheckinRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        DailyCheckin::updateOrCreate(
            [
                'user_id' => $user->id,
                'checkin_date' => DailyCheckin::todayFor($user),
            ],
            [
                'mood' => $data['mood'],
                'note' => $data['note'] ?? null,
                'visibility' => $data['visibility'] ?? $user->privacy->default_entry_visibility->value,
            ],
        );

        return back()->with('status', 'Check-in saved.');
    }

    public function destroy(Request $request, DailyCheckin $checkin): RedirectResponse
    {
        abort_unless($checkin->user_id === $request->user()->id, 404);

        $checkin->delete();

        return back()->with('status', 'Check-in deleted.');
    }

    private function present(DailyCheckin $c): array
    {
        return [
            'id' => $c->id,
            'date' => $c->checkin_date->toDateString(),
            'mood' => $c->mood->value,
            'note' => $c->note,
            'visibility' => $c->visibility->value,
        ];
    }

    /** Adjust this to however your app links partners. */
    private function partnerFor(User $user): ?User
    {
        if (method_exists($user, 'partner') && $user->partner) {
            return $user->partner;
        }

        return User::where('id', '!=', $user->id)->first();
    }
}