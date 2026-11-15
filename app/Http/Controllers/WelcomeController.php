<?php

namespace App\Http\Controllers;

use App\Models\Background;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    /** Guests see the landing page; logged-in users get Home as before. */
    public function __invoke(Request $request)
    {
        if ($request->user()) {
            return app(HomeController::class)($request);
        }

        $active = Background::where('is_active', true)->first();

        return Inertia::render('welcome', [
            'background' => $active ? ['version' => $active->id] : null,
        ]);
    }
}