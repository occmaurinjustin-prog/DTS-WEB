<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function show($waybill)
    {
        $delivery = Delivery::where('waybill', $waybill)
            ->with(['driver'])
            ->first();

        if (!$delivery) {
            return redirect('/')->with('error', 'Invalid Waybill Number or delivery not found.');
        }

        $currentLocation = null;

        // Use driver's live location from the Driver table
        if ($delivery->driver && $delivery->driver->current_latitude && $delivery->driver->current_longitude) {
            $currentLocation = [
                'lat' => (float) $delivery->driver->current_latitude,
                'long' => (float) $delivery->driver->current_longitude,
                'speed_kmh' => (float) ($delivery->driver->current_speed ?? 0),
            ];
        }

        return inertia('Tracking', [
            'delivery' => $delivery,
            'currentLocation' => $currentLocation
        ]);
    }
}
