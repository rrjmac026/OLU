<?php

namespace App\Http\Controllers;

use App\Enums\LetterKind;
use App\Http\Requests\LetterRequest;
use App\Models\Letter;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LetterController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $letters = Letter::with('recipient.profile')
            ->visibleTo($user)
            ->latest()
            ->get()
            ->map(fn (Letter $l) => $this->payload($l, $user));

        return Inertia::render('letters/index', ['letters' => $letters]);
    }

    public function create(): Response
    {
        return Inertia::render('letters/create');
    }

    public function store(LetterRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $partner = User::where('id', '!=', $user->id)
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if (! $partner) {
            throw ValidationException::withMessages([
                'title' => 'Create her account first in Admin → Users.',
            ]);
        }

        $letter = Letter::create([
            'sender_id' => $user->id,
            'recipient_id' => $partner->id,
            'kind' => $data['kind'],
            'occasion' => $data['kind'] === LetterKind::OpenWhen->value ? $data['occasion'] : null,
            'title' => $data['title'],
            'body' => $data['body'],
            'unlock_at' => $this->parseUnlock($data['unlock_at'] ?? null, $this->tzFor($partner)),
        ]);

        return redirect("/letters/{$letter->id}")->with('status', 'Letter sealed.');
    }

    public function show(Request $request, Letter $letter): Response
    {
        $user = $request->user();
        abort_unless($letter->canBeViewedBy($user), 404);

        return Inertia::render('letters/show', [
            'letter' => $this->payload($letter->load('recipient.profile'), $user, withBody: true),
        ]);
    }

    public function edit(Request $request, Letter $letter): Response
    {
        $letter = $this->senderOrFail($request, $letter);

        return Inertia::render('letters/edit', [
            'letter' => $this->payload($letter->load('recipient.profile'), $request->user(), withBody: true),
        ]);
    }

    public function update(LetterRequest $request, Letter $letter): RedirectResponse
    {
        $letter = $this->senderOrFail($request, $letter);
        $data = $request->validated();

        $letter->update([
            'kind' => $data['kind'],
            'occasion' => $data['kind'] === LetterKind::OpenWhen->value ? $data['occasion'] : null,
            'title' => $data['title'],
            'body' => $data['body'],
            'unlock_at' => $this->parseUnlock($data['unlock_at'] ?? null, $this->tzFor($letter->recipient)),
        ]);

        return redirect("/letters/{$letter->id}")->with('status', 'Letter updated.');
    }

    public function destroy(Request $request, Letter $letter): RedirectResponse
    {
        $this->senderOrFail($request, $letter)->delete();

        return redirect('/letters')->with('status', 'Letter deleted.');
    }

    /** Recipient opens a sealed letter. Only the recipient's own read state is stored. */
    public function open(Request $request, Letter $letter): RedirectResponse
    {
        $user = $request->user();
        abort_unless($letter->isRecipient($user), 404);

        if ($letter->isLocked()) {
            return back()->with('status', 'This one is not ready to open yet.');
        }

        if ($letter->opened_at === null) {
            $letter->forceFill(['opened_at' => now()])->save();
        }

        return redirect("/letters/{$letter->id}");
    }

    // ---------- helpers ----------

    private function senderOrFail(Request $request, Letter $letter): Letter
    {
        abort_unless($letter->isSender($request->user()), 404);

        return $letter;
    }

    private function tzFor(?User $user): string
    {
        return $user?->profile?->timezone ?: 'UTC';
    }

    /** Admin types a local time; it is read in the recipient's timezone and stored as UTC. */
    private function parseUnlock(?string $value, string $tz): ?Carbon
    {
        return $value ? Carbon::createFromFormat('Y-m-d\TH:i', $value, $tz)->utc() : null;
    }

    private function payload(Letter $letter, User $viewer, bool $withBody = false): array
    {
        $isSender = $letter->isSender($viewer);
        $tz = $this->tzFor($letter->recipient);
        $local = $letter->unlock_at?->copy()->setTimezone($tz);

        $locked = ! $isSender && $letter->isLocked();
        $sealed = ! $isSender && ! $locked && $letter->opened_at === null;

        return [
            'id' => $letter->id,
            'kind' => $letter->kind->value,
            'occasion' => $letter->occasion?->value,
            'title' => $letter->title,
            'is_sender' => $isSender,
            'locked' => $locked,
            'sealed' => $sealed,
            // Read state is only revealed to the recipient, never the sender.
            'opened' => $isSender ? null : $letter->opened_at !== null,
            'unlock_label' => $local?->format('M j, Y · g:i A'),
            'unlock_input' => $local?->format('Y-m-d\TH:i'),
            'created_label' => $letter->created_at->copy()->setTimezone($tz)->format('M j, Y'),
            // Body is only sent when the viewer may actually read it.
            'body' => $withBody && ($isSender || (! $locked && ! $sealed)) ? $letter->body : null,
        ];
    }
}