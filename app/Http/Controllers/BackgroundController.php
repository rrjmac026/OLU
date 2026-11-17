<?php

namespace App\Http\Controllers;

use App\Models\Background;
use App\Services\Media\MediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class BackgroundController extends Controller
{
    /** Keys of the built-in animated scenes (must match resources/js/features/backgrounds/scenes). */
    private const PRESETS = ['starry', 'sunset', 'comet', 'sakura', 'cozy', 'field', 'castle', 'lake'];

    public function __construct(private MediaStorage $media) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $items = Background::with('owner.profile')
            ->latest('id')
            ->get()
            ->map(fn (Background $b) => [
                'id' => $b->id,
                'is_active' => $b->is_active,
                'is_mine' => $b->user_id === $user->id,
                'added_by' => $b->owner->profile?->display_name ?: $b->owner->name,
                'preset' => $b->preset,
            ]);

        return Inertia::render('backgrounds/index', ['backgrounds' => $items]);
    }

    /** Either of you can upload; no approval needed. */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'activate' => ['nullable', 'boolean'],
            'preset' => ['nullable', 'string', Rule::in(self::PRESETS)],
        ], [
            'image.mimes' => 'Backgrounds must be JPG, PNG or WebP.',
            'image.max' => 'The image must be 8 MB or smaller.',
        ]);

        $file = $request->file('image');
        $mime = $file->getMimeType();
        $size = $file->getSize();
        $path = $this->media->put($file, 'backgrounds');

        $background = Background::create([
            'user_id' => $request->user()->id,
            'path' => $path,
            'mime' => $mime,
            'size' => $size,
            'is_active' => false,
        ]);

        // Set directly so this works without touching the model's $fillable.
        if ($request->filled('preset')) {
            $background->preset = $request->input('preset');
            $background->save();
        }

        if ($request->boolean('activate', true)) {
            $this->makeActive($background);
        }

        return back()->with('status', 'Background added.');
    }

    public function activate(Background $background): RedirectResponse
    {
        $this->makeActive($background);

        return back()->with('status', 'Background changed.');
    }

    /** Back to the default gradient. */
    public function clear(): RedirectResponse
    {
        Background::where('is_active', true)->update(['is_active' => false]);

        return back()->with('status', 'Using the default background.');
    }

    public function destroy(Request $request, Background $background): RedirectResponse
    {
        abort_unless($background->user_id === $request->user()->id, 404);

        $this->media->delete($background->path);
        $background->delete();

        return back()->with('status', 'Background deleted.');
    }

    /** Thumbnails in the picker: login required. */
    public function image(Request $request, Background $background): SymfonyResponse
    {
        return $this->serve($request, $background, 'private, max-age=3600');
    }

    /** Public: only the ACTIVE background is ever exposed to guests. */
    public function backdrop(Request $request): SymfonyResponse
    {
        $active = Background::where('is_active', true)->first();
        abort_unless($active, 404);

        return $this->serve($request, $active, 'public, max-age=86400');
    }

    /** Public: tells the landing/login page which animated scene (if any) is active. */
    public function meta(): JsonResponse
    {
        $active = Background::where('is_active', true)->first();

        return response()
            ->json(['preset' => $active?->preset])
            ->header('Cache-Control', 'public, max-age=60');
    }

    private function serve(Request $request, Background $background, string $cache): SymfonyResponse
    {
        return $this->media->response($request, $background->path, $background->mime, $cache);
    }

    private function makeActive(Background $background): void
    {
        DB::transaction(function () use ($background) {
            Background::where('is_active', true)->update(['is_active' => false]);
            $background->update(['is_active' => true]);
        });
    }
}
