<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Throwable;

class WebPushService
{
    public function isConfigured(): bool
    {
        return filled(config('webpush.vapid.subject'))
            && filled(config('webpush.vapid.public_key'))
            && filled(config('webpush.vapid.private_key'));
    }

    /**
     * Send a push to every device the user has subscribed.
     *
     * $body is the safe, generic text. $previewBody is only used when the
     * user has turned notification previews on. This never throws, so a push
     * failure can never break sending a chat message.
     */
    public function sendToUser(
        User $user,
        string $title,
        string $body,
        ?string $previewBody = null,
        string $url = '/',
        ?string $tag = null,
    ): void {
        try {
            $settings = $user->settings;

            if (! $settings || ! $settings->notifications_enabled || ! $this->isConfigured()) {
                return;
            }

            $subscriptions = $user->pushSubscriptions()->get();

            if ($subscriptions->isEmpty()) {
                return;
            }

            $showPreview = (bool) $settings->notification_previews && filled($previewBody);

            $payload = json_encode([
                'title' => $title,
                'body' => $showPreview ? $previewBody : $body,
                'url' => $url,
                'tag' => $tag,
                'icon' => config('webpush.icon'),
                'badge' => config('webpush.badge'),
            ], JSON_UNESCAPED_UNICODE);

            $webPush = new WebPush(
                [
                    'VAPID' => [
                        'subject' => config('webpush.vapid.subject'),
                        'publicKey' => config('webpush.vapid.public_key'),
                        'privateKey' => config('webpush.vapid.private_key'),
                    ],
                ],
                [
                    'TTL' => config('webpush.ttl'),
                    'urgency' => config('webpush.urgency'),
                ],
                10, // seconds, so a slow push service can't hang the request
            );

            foreach ($subscriptions as $sub) {
                $webPush->queueNotification(
                    Subscription::create([
                        'endpoint' => $sub->endpoint,
                        'publicKey' => $sub->public_key,
                        'authToken' => $sub->auth_token,
                        'contentEncoding' => $sub->content_encoding,
                    ]),
                    $payload,
                );
            }

            foreach ($webPush->flush() as $report) {
                // 404/410 means the subscription is gone (permission revoked,
                // site data cleared, app removed), so delete it.
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where(
                        'endpoint_hash',
                        PushSubscription::hashEndpoint($report->getEndpoint())
                    )->delete();
                } elseif (! $report->isSuccess()) {
                    Log::warning('Web push failed', [
                        'reason' => $report->getReason(),
                    ]);
                }
            }
        } catch (Throwable $e) {
            Log::warning('Web push error: '.$e->getMessage());
        }
    }
}