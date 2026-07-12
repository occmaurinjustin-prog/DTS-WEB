<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RescueUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $rescue;

    public function __construct($rescue = null)
    {
        $this->rescue = $rescue;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('rescue'),
        ];
    }
}
