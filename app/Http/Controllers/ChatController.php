<?php

namespace App\Http\Controllers;

use App\Events\ChatUpdated;
use App\Models\Message;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    private const PAGE = 50;

    public function index(Request $request): Response
    {
        $me = $request->user();
        $partner = $this->partnerFor($me);

        if (! $partner) {
            return Inertia::render('chat/index', [
                'meId' => $me->id,
                'partner' => null,
                'channel' => null,
                'messages' => [],
                'hasMore' => false,
            ]);
        }

        $rows = Message::between($me->id, $partner->id)
            ->visibleTo($me->id)
            ->latest('id')
            ->limit(self::PAGE + 1)
            ->get();

        $this->markRead($me, $partner);

        return Inertia::render('chat/index', [
            'meId' => $me->id,
            'partner' => $this->partnerPayload($partner),
            'channel' => Message::channelFor($me->id, $partner->id),
            'messages' => $rows->take(self::PAGE)->reverse()->values()->map->toPayload()->all(),
            'hasMore' => $rows->count() > self::PAGE,
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        $me = $request->user();
        $partner = $this->partnerFor($me);

        if (! $partner) {
            return response()->json(['me' => $me->id, 'channel' => null, 'unread' => false]);
        }

        $unread = Message::where('sender_id', $partner->id)
            ->where('recipient_id', $me->id)
            ->whereNull('read_at')
            ->whereNull('unsent_at')
            ->whereNull('recipient_removed_at')
            ->exists();

        return response()->json([
            'me' => $me->id,
            'channel' => Message::channelFor($me->id, $partner->id),
            'unread' => $unread,
        ]);
    }

    public function older(Request $request): JsonResponse
    {
        $me = $request->user();
        $partner = $this->partnerFor($me);
        abort_unless($partner, 404);

        $before = (int) $request->query('before');

        $rows = Message::between($me->id, $partner->id)
            ->visibleTo($me->id)
            ->where('id', '<', $before)
            ->latest('id')
            ->limit(self::PAGE + 1)
            ->get();

        return response()->json([
            'messages' => $rows->take(self::PAGE)->reverse()->values()->map->toPayload()->all(),
            'hasMore' => $rows->count() > self::PAGE,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $me = $request->user();
        $partner = $this->partnerFor($me);
        abort_unless($partner, 422, 'Nobody to message yet.');

        $data = $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $message = Message::create([
            'sender_id' => $me->id,
            'recipient_id' => $partner->id,
            'body' => $data['body'],
        ]);

        $this->push($me->id, $partner->id, 'sent', ['message' => $message->toPayload()]);

        // Web push to the partner's devices. Never throws, and respects her
        // notification settings (previews are off unless she turned them on).
        app(WebPushService::class)->sendToUser(
            $partner,
            config('app.name'),
            'You have a new message 💗',
            Str::limit($message->body, 80),
            '/chat',
            'chat',
        );

        return response()->json($message->toPayload(), 201);
    }

    public function update(Request $request, Message $message): JsonResponse
    {
        $me = $request->user();
        abort_unless($message->sender_id === $me->id && $message->unsent_at === null, 404);

        $data = $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $message->forceFill(['body' => $data['body'], 'edited_at' => now()])->save();

        $this->push($me->id, $message->recipient_id, 'edited', ['message' => $message->toPayload()]);

        return response()->json($message->toPayload());
    }

    /** Unsend: gone for both of you. The text is wiped, not just hidden. */
    public function unsend(Request $request, Message $message): JsonResponse
    {
        $me = $request->user();
        abort_unless($message->sender_id === $me->id && $message->unsent_at === null, 404);

        $message->forceFill(['body' => '', 'unsent_at' => now()])->save();

        $this->push($me->id, $message->recipient_id, 'unsent', ['message' => $message->toPayload()]);

        return response()->json($message->toPayload());
    }

    /** Remove from my view only. The other person still sees it. */
    public function remove(Request $request, Message $message)
    {
        $me = $request->user();

        if ($message->sender_id === $me->id) {
            $message->forceFill(['sender_removed_at' => now()])->save();
        } elseif ($message->recipient_id === $me->id) {
            $message->forceFill(['recipient_removed_at' => now()])->save();
        } else {
            abort(404);
        }

        return response()->noContent();
    }

    public function read(Request $request)
    {
        $me = $request->user();

        if ($partner = $this->partnerFor($me)) {
            $this->markRead($me, $partner);
        }

        return response()->noContent();
    }

    private function partnerFor(User $me): ?User
    {
        return User::where('id', '!=', $me->id)
            ->where('is_active', true)
            ->with('profile')
            ->orderBy('id')
            ->first();
    }

    private function partnerPayload(User $partner): array
    {
        return [
            'id' => $partner->id,
            'name' => $partner->profile?->display_name ?: $partner->name,
        ];
    }

    private function markRead(User $me, User $partner): void
    {
        $ids = Message::where('sender_id', $partner->id)
            ->where('recipient_id', $me->id)
            ->whereNull('read_at')
            ->pluck('id');

        if ($ids->isEmpty()) {
            return;
        }

        $now = now();
        Message::whereIn('id', $ids)->update(['read_at' => $now]);

        $this->push($me->id, $partner->id, 'read', [
            'reader_id' => $me->id,
            'read_at' => $now->toIso8601String(),
        ]);
    }

    private function push(int $a, int $b, string $type, array $data): void
    {
        event(new ChatUpdated(Message::channelFor($a, $b), $type, $data));
    }
}