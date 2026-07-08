<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $deliveryId;
    public $deliveryData;

    /**
     * Create a new event instance.
     */
    public function __construct($deliveryId)
    {
        $this->deliveryId = $deliveryId;
        
        // Fetch the delivery with client info to pass to the frontend
        $delivery = \App\Models\Delivery::with('client')->find($deliveryId);
        
        if ($delivery) {
            $this->deliveryData = [
                'id' => $delivery->delivery_id,
                'waybill' => $delivery->waybill,
                'client_name' => $delivery->client ? $delivery->client->client_name : 'Unknown Client',
                'status' => $delivery->delivery_status,
                'created_at' => $delivery->created_at->toIso8601String(),
            ];
        }
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('deliveries'),
        ];
    }
}
