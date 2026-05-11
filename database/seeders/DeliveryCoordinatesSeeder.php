<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Delivery;

class DeliveryCoordinatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample coordinates for common locations in the Philippines
        $locations = [
            // Cagayan de Oro area (near your location)
            ['lat' => 8.5046, 'lng' => 124.5844, 'name' => 'CDO Downtown'],
            ['lat' => 8.5123, 'lng' => 124.5921, 'name' => 'CDO Uptown'],
            ['lat' => 8.4987, 'lng' => 124.5765, 'name' => 'CDO West'],
            ['lat' => 8.5234, 'lng' => 124.6012, 'name' => 'CDO East'],
            ['lat' => 8.4890, 'lng' => 124.5689, 'name' => 'CDO South'],
            
            // Manila area
            ['lat' => 14.5995, 'lng' => 120.9842, 'name' => 'Manila'],
            ['lat' => 14.6091, 'lng' => 121.0223, 'name' => 'Makati'],
            ['lat' => 14.6760, 'lng' => 121.0437, 'name' => 'Quezon City'],
            ['lat' => 14.5439, 'lng' => 121.0194, 'name' => 'Pasay'],
            ['lat' => 14.6306, 'lng' => 121.0018, 'name' => 'Mandaluyong'],
            
            // Cebu area
            ['lat' => 10.3157, 'lng' => 123.8854, 'name' => 'Cebu City'],
            ['lat' => 10.3294, 'lng' => 123.9078, 'name' => 'Mandaue'],
            ['lat' => 10.2660, 'lng' => 123.8586, 'name' => 'Lapu-Lapu'],
            
            // Davao area
            ['lat' => 7.1907, 'lng' => 125.4553, 'name' => 'Davao City'],
            ['lat' => 7.2124, 'lng' => 125.4678, 'name' => 'Davao North'],
        ];

        $deliveries = Delivery::whereNull('pickup_latitude')
            ->orWhereNull('delivery_latitude')
            ->get();

        foreach ($deliveries as $delivery) {
            // Random pickup location
            $pickupLocation = $locations[array_rand($locations)];
            
            // Random delivery location (different from pickup)
            $deliveryLocation = $locations[array_rand($locations)];
            while ($deliveryLocation === $pickupLocation) {
                $deliveryLocation = $locations[array_rand($locations)];
            }

            $delivery->update([
                'pickup_latitude' => $pickupLocation['lat'] + (rand(-100, 100) / 10000), // Add small random offset
                'pickup_longitude' => $pickupLocation['lng'] + (rand(-100, 100) / 10000),
                'delivery_latitude' => $deliveryLocation['lat'] + (rand(-100, 100) / 10000),
                'delivery_longitude' => $deliveryLocation['lng'] + (rand(-100, 100) / 10000),
            ]);
        }

        $this->command->info('Updated ' . $deliveries->count() . ' deliveries with coordinates!');
    }
}
