<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Driver;

class DriverGpsSeeder extends Seeder
{
    public function run(): void
    {
        // Manila area coordinates
        $locations = [
            ['lat' => 14.5995, 'lng' => 120.9842, 'speed' => 45],  // Manila
            ['lat' => 14.5547, 'lng' => 121.0244, 'speed' => 0],   // Makati
            ['lat' => 14.6760, 'lng' => 121.0437, 'speed' => 62],  // Quezon City
            ['lat' => 14.5179, 'lng' => 121.0509, 'speed' => 35],  // Pasig
            ['lat' => 14.4123, 'lng' => 120.9350, 'speed' => 0],   // Cavite
            ['lat' => 14.7200, 'lng' => 121.1200, 'speed' => 78],  // Marikina
        ];

        $drivers = Driver::all();
        
        foreach ($drivers as $index => $driver) {
            $location = $locations[$index % count($locations)];
            
            $driver->update([
                'current_latitude' => $location['lat'] + (rand(-50, 50) / 10000),
                'current_longitude' => $location['lng'] + (rand(-50, 50) / 10000),
                'current_speed' => $location['speed'],
                'last_location_update' => now()->subMinutes(rand(1, 60)),
            ]);
        }

        $this->command->info('GPS data seeded for ' . $drivers->count() . ' drivers.');
    }
}
