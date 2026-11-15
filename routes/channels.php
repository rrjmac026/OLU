<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Only the two participants can join their chat channel.
Broadcast::channel('chat.{a}.{b}', function ($user, $a, $b) {
    $a = (int) $a;
    $b = (int) $b;

    return $a < $b && in_array($user->id, [$a, $b], true);
});

Broadcast::channel('tictactoe.{a}.{b}', function ($user, int $a, int $b) {
    return $a !== $b && in_array($user->id, [$a, $b], true);
});

Broadcast::channel('memorymatch.{a}.{b}', function ($user, int $a, int $b) {
    return $a !== $b && in_array($user->id, [$a, $b], true);
});