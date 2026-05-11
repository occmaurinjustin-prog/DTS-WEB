<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Delivery;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_clients' => Client::count(),
            'total_drivers' => Driver::count(),
            'total_trucks' => \App\Models\Truck::count(),
            'available_trucks' => \App\Models\Truck::where('truck_status', 'available')->count(),
            'total_deliveries' => Delivery::count(),
            'pending_deliveries' => Delivery::where('delivery_status', 'pending')->count(),
            'in_transit_deliveries' => Delivery::where('delivery_status', 'in_transit')->count(),
            'delivered_deliveries' => Delivery::where('delivery_status', 'delivered')->count(),
            'total_inquiries' => 0, // Inquiries table deleted
            'open_inquiries' => 0,
        ];

        $recentDeliveries = Delivery::with(['client', 'driver.user'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentInquiries = collect(); // Inquiries table deleted

        $users = User::orderBy('created_at', 'desc')->get();

        return inertia('Admin/Dashboard', [
            'stats' => $stats,
            'recentDeliveries' => $recentDeliveries,
            'recentInquiries' => $recentInquiries,
            'authUser' => Auth::user(),
        ]);
    }

    public function users()
    {
        $users = User::with('driver')->orderBy('created_at', 'desc')->get();
        $trucks = \App\Models\Truck::orderBy('plate_number')->get();

        return inertia('Admin/Users', [
            'users' => $users,
            'trucks' => $trucks,
            'authUser' => Auth::user(),
        ]);
    }

    public function attendance()
    {
        return inertia('Admin/Attendance', [
            'authUser' => Auth::user(),
        ]);
    }

    public function drivers()
    {
        $drivers = Driver::with('user')->orderBy('created_at', 'desc')->get();
        
        $stats = [
            'total_drivers' => Driver::count(),
            'available_drivers' => Driver::where('availability_status', 'available')->count(),
            'busy_drivers' => Driver::where('availability_status', 'busy')->count(),
            'in_transit_drivers' => Driver::where('availability_status', 'in_transit')->count(),
            'off_duty_drivers' => Driver::where('availability_status', 'off_duty')->count(),
        ];

        $recentAssignments = Delivery::with(['driver.user'])
            ->whereNotNull('driver_id')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return inertia('Admin/Drivers', [
            'drivers' => $drivers,
            'stats' => $stats,
            'recentAssignments' => $recentAssignments,
            'authUser' => Auth::user(),
        ]);
    }

    public function deliveries()
    {
        $pendingDeliveries = Delivery::with(['client', 'driver.user', 'truck', 'user'])
            ->where('delivery_status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        $allDeliveries = Delivery::with(['client', 'driver.user', 'truck', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Admin/Deliveries', [
            'authUser' => Auth::user(),
            'pendingDeliveries' => $pendingDeliveries,
            'allDeliveries' => $allDeliveries,
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function approveDelivery(\App\Models\Delivery $delivery)
    {
        $delivery->update([
            'delivery_status' => 'approved',
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Delivery approved successfully!');
    }

    public function rejectDelivery(\App\Models\Delivery $delivery)
    {
        $delivery->update([
            'delivery_status' => 'cancelled',
            'rejected_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Delivery rejected.');
    }

    public function sendToDriver(Request $request, \App\Models\Delivery $delivery)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,driver_id',
        ]);

        // Update delivery status to assigned and set the driver
        $delivery->update([
            'driver_id' => $validated['driver_id'],
            'delivery_status' => 'assigned',
            'sent_to_driver_at' => now(),
            'sent_to_driver_by' => Auth::id(),
        ]);

        // Here you could also:
        // 1. Send a push notification to the driver
        // 2. Create a driver notification record
        // 3. Send an email/SMS to the driver

        return redirect()->back()->with('success', 'Delivery details sent to driver successfully!');
    }

    public function routes()
    {
        $pendingDeliveries = \App\Models\Delivery::where('delivery_status', 'pending')->count();

        // Fetch drivers with 'in_transit' OR 'assigned' status and their current delivery
        $drivers = Driver::with(['user', 'truck', 'deliveries' => function($query) {
                $query->whereIn('delivery_status', ['assigned', 'in_transit'])
                      ->with('client')
                      ->latest();
            }])
            ->whereIn('availability_status', ['in_transit', 'busy'])
            ->whereNotNull('current_latitude')
            ->whereNotNull('current_longitude')
            ->get()
            ->map(function ($driver) {
                // Get the current delivery (assigned or in_transit)
                $currentDelivery = $driver->deliveries->first();

                return [
                    'id' => $driver->driver_id,
                    'plate' => $driver->truck?->plate_number ?? 'NO-TRUCK',
                    'driver' => $driver->user?->firstname . ' ' . $driver->user?->lastname ?? 'Unknown',
                    'phone' => $driver->user?->contact_number ?? 'N/A',
                    'speed' => $driver->current_speed ?? 0,
                    'status' => $driver->current_speed > 0 ? 'moving' : ($driver->current_speed === 0 ? 'stopped' : 'offline'),
                    'lastUpdate' => $driver->last_location_update ? \Carbon\Carbon::parse($driver->last_location_update)->diffForHumans() : 'Never',
                    'lat' => (float) $driver->current_latitude,
                    'lng' => (float) $driver->current_longitude,
                    // Current delivery info with status
                    'delivery' => $currentDelivery ? [
                        'id' => $currentDelivery->delivery_id,
                        'tracking' => $currentDelivery->tracking_number,
                        'client' => $currentDelivery->client?->client_name ?? 'Unknown',
                        'delivery_status' => $currentDelivery->delivery_status, // 'assigned' or 'in_transit'
                        'navigation_phase' => $currentDelivery->navigation_phase ?? 'pickup', // 'pickup' or 'delivery'
                        'pickup_lat' => (float) $currentDelivery->pickup_latitude,
                        'pickup_lng' => (float) $currentDelivery->pickup_longitude,
                        'pickup_address' => $currentDelivery->pickup_address,
                        'dest_lat' => (float) $currentDelivery->delivery_latitude,
                        'dest_lng' => (float) $currentDelivery->delivery_longitude,
                        'dest_address' => $currentDelivery->delivery_address,
                        'weight' => $currentDelivery->weight_tons,
                    ] : null,
                ];
            });

        return inertia('Admin/Routes', [
            'authUser' => Auth::user(),
            'pendingDeliveries' => $pendingDeliveries,
            'drivers' => $drivers,
        ]);
    }
}
