<?php

namespace App\Http\Controllers;

use App\Models\GardenPlant;
use App\Models\GardenWallet;
use App\Support\Garden;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GardenController extends Controller
{
    public function index(Request $request): Response
    {
        $me = $request->user();

        if (! Garden::enabled($me)) {
            return Inertia::render('garden/index', [
                'enabled' => false,
                'drops' => 0,
                'slots' => GardenPlant::SLOTS,
                'plants' => [],
                'kinds' => [],
            ]);
        }

        $wallet = GardenWallet::firstOrCreate(['user_id' => $me->id]);

        $plants = GardenPlant::orderBy('slot')->get()->map(fn (GardenPlant $p) => [
            'id' => $p->id,
            'slot' => $p->slot,
            'stage' => $p->stage,
            'emoji' => $p->emoji(),
            'bloomed' => $p->stage >= GardenPlant::MAX_STAGE,
        ])->values();

        $kinds = collect(GardenPlant::KINDS)
            ->map(fn (string $emoji, string $key) => ['key' => $key, 'emoji' => $emoji])
            ->values();

        return Inertia::render('garden/index', [
            'enabled' => true,
            'drops' => Garden::available($me, $wallet->spent),
            'slots' => GardenPlant::SLOTS,
            'plants' => $plants,
            'kinds' => $kinds,
        ]);
    }

    public function plant(Request $request): RedirectResponse
    {
        $me = $request->user();
        abort_unless(Garden::enabled($me), 403);

        $data = $request->validate([
            'slot' => ['required', 'integer', 'between:0,'.(GardenPlant::SLOTS - 1)],
            'kind' => ['required', Rule::in(array_keys(GardenPlant::KINDS))],
        ]);

        // If the plot was just taken by the other person, this does nothing.
        GardenPlant::firstOrCreate(
            ['slot' => $data['slot']],
            ['kind' => $data['kind'], 'planted_by' => $me->id],
        );

        return back();
    }

    public function water(Request $request, int $plant): RedirectResponse
    {
        $me = $request->user();
        abort_unless(Garden::enabled($me), 403);

        DB::transaction(function () use ($me, $plant) {
            $wallet = GardenWallet::firstOrCreate(['user_id' => $me->id]);
            $wallet = GardenWallet::whereKey($wallet->id)->lockForUpdate()->first();
            $p = GardenPlant::whereKey($plant)->lockForUpdate()->firstOrFail();

            abort_if($p->stage >= GardenPlant::MAX_STAGE, 422);
            abort_if(Garden::available($me, $wallet->spent) < 1, 422);

            $p->stage = $p->stage + 1;
            $p->save();

            $wallet->spent = $wallet->spent + 1;
            $wallet->save();
        });

        return back();
    }

    public function destroy(Request $request, int $plant): RedirectResponse
    {
        abort_unless(Garden::enabled($request->user()), 403);

        GardenPlant::whereKey($plant)->firstOrFail()->delete();

        return back();
    }
}