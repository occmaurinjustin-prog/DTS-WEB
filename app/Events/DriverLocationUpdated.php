<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $id;
    public $lat;
    public $lng;
    public $speed;
    public $status;
    public $isGpsEnabled;
    public $deliveryStatus;
    public $wasOffline;

    /**
     * Create a new event instance.
     */
    public function __construct($driverId, $lat, $lng, $speed, $status, $isGpsEnabled, $deliveryStatus = null, $wasOffline = false)
    {
        $this->id = $driverId;
        $this->lat = (float) $lat;
        $this->lng = (float) $lng;
        $this->speed = $speed;
        $this->status = $status;
        $this->isGpsEnabled = $isGpsEnabled;
        $this->deliveryStatus = $deliveryStatus;
        $this->wasOffline = $wasOffline;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('drivers'),
        ];
    }
}
