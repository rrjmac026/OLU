<?php

return [

    /*
    |--------------------------------------------------------------------------
    | VAPID keys
    |--------------------------------------------------------------------------
    | Generated once (npx web-push generate-vapid-keys or php artisan
    | webpush:keys). The public key is shared with the browser; the private
    | key must stay on the server only.
    */

    'vapid' => [
        'subject' => env('VAPID_SUBJECT'),
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Delivery options
    |--------------------------------------------------------------------------
    | ttl: how many seconds the push service keeps a message if her phone is
    | offline. urgency: high wakes the device promptly, which suits chat.
    */

    'ttl' => (int) env('WEBPUSH_TTL', 86400),

    'urgency' => env('WEBPUSH_URGENCY', 'high'),

    /*
    |--------------------------------------------------------------------------
    | Notification defaults
    |--------------------------------------------------------------------------
    */

    'icon' => '/icons/icon-192.png',

    'badge' => '/icons/badge-72.png',

];