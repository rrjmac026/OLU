<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class TicTacToeUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /** $a and $b are the two user ids, smaller first. */
    public function __construct(public int $a, public int $b) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("tictactoe.{$this->a}.{$this->b}")];
    }

    public function broadcastAs(): string
    {
        return 'TicTacToeUpdated';
    }

    public function broadcastWith(): array
    {
        return []; // just a ping, the client reloads the game itself
    }
}