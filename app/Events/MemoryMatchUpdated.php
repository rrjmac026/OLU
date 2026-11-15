<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class MemoryMatchUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /** $a and $b are the two user ids, smaller first. */
    public function __construct(public int $a, public int $b) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("memorymatch.{$this->a}.{$this->b}")];
    }

    public function broadcastAs(): string
    {
        return 'MemoryMatchUpdated';
    }

    public function broadcastWith(): array
    {
        return []; // just a ping, the client reloads the game itself
    }
}