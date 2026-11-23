<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    /** Public VAPID key the browser needs to subscribe. */
    public function key(): JsonResponse
    {
        return response()->json([
            'publicKey' => config('webpush.vapid.public_key'),
        ]);
    }

    /** Save (or re-assign) this device's subscription for the current user. */
    public function store(Request $request): JsonResponse
    {
        $user = $this->currentUser($request);

        $data = $request->validate([
            'endpoint' => ['required', 'url', 'starts_with:https://', 'max:2000'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
            'contentEncoding' => ['nullable', 'in:aes128gcm,aesgcm'],
        ]);

        // If the same device was used by another account, it moves to this one.
        PushSubscription::updateOrCreate(
            ['endpoint_hash' => PushSubscription::hashEndpoint($data['endpoint'])],
            [
                'user_id' => $user->id,
                'endpoint' => $data['endpoint'],
                'public_key' => $data['keys']['p256dh'],
                'auth_token' => $data['keys']['auth'],
                'content_encoding' => $data['contentEncoding'] ?? 'aes128gcm',
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ],
        );

        return response()->json(['subscribed' => true]);
    }

    /** Remove this device's subscription (toggle off or logout). */
    public function destroy(Request $request): JsonResponse
    {
        $user = $this->currentUser($request);

        $data = $request->validate([
            'endpoint' => ['required', 'string', 'max:2000'],
        ]);

        $user->pushSubscriptions()
            ->where('endpoint_hash', PushSubscription::hashEndpoint($data['endpoint']))
            ->delete();

        return response()->json(['subscribed' => false]);
    }

    private function currentUser(Request $request): User
    {
        return $request->user()
            ?? User::findOrFail($request->session()->get('auth_user_id'));
    }
}