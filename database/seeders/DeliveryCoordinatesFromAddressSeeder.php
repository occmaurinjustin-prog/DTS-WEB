<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Delivery;
use App\Models\Client;

class DeliveryCoordinatesFromAddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use client's coordinates if available
        $deliveries = Delivery::all();
        
        foreach ($deliveries as $delivery) {
            $pickupLat = null;
            $pickupLng = null;
            $deliveryLat = null;
            $deliveryLng = null;
            
            // Try to get coordinates from client
            if ($delivery->client_id) {
                $client = Client::find($delivery->client_id);
                if ($client) {
                    // Use client's business location as pickup
                    $pickupLat = $client->latitude ?? $client->business_latitude;
                    $pickupLng = $client->longitude ?? $client->business_longitude;
                    
                    // Use client's delivery location
                    $deliveryLat = $client->delivery_latitude ?? $client->latitude;
                    $deliveryLng = $client->delivery_longitude ?? $client->longitude;
                }
            }
            
            // If still null, use default coordinates (Cagayan de Oro area)
            if (!$pickupLat) {
                $pickupLat = 8.5046 + (rand(-500, 500) / 10000);
                $pickupLng = 124.5844 + (rand(-500, 500) / 10000);
            }
            
            if (!$deliveryLat) {
                $deliveryLat = 8.5123 + (rand(-500, 500) / 10000);
                $deliveryLng = 124.5921 + (rand(-500, 500) / 10000);
            }
            
            $delivery->update([
                'pickup_latitude' => $pickupLat,
                'pickup_longitude' => $pickupLng ?? 124.5844,
                'delivery_latitude' => $deliveryLat,
                'delivery_longitude' => $deliveryLng ?? 124.5921,
            ]);
        }
        
        $this->command->info('Updated ' . $deliveries->count() . ' deliveries with coordinates from client data!');
    }
}
