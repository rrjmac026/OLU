<?php

namespace App\Http\Controllers;

use App\Models\DailyCheckin;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $checkin = DailyCheckin::ownedBy($user)
            ->where('checkin_date', DailyCheckin::todayFor($user))
            ->first();

        return Inertia::render('home', [
            'checkin_today' => $checkin ? ['mood' => $checkin->mood->value] : null,
        ]);
    }
}