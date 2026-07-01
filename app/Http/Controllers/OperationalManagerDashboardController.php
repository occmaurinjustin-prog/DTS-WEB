<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Driver;
use App\Models\Client;

class OperationalManagerDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Use user_id instead of manager_id since operation_managers table is deleted
        $userId = $user->user_id;

        // Get real dashboard statistics
        $stats = [
            'total_deliveries' => \App\Models\Delivery::where('user_id', $userId)->count(),
            'completed_deliveries' => \App\Models\Delivery::where('user_id', $userId)->where('delivery_status', 'delivered')->count(),
            'in_progress_deliveries' => \App\Models\Delivery::where('user_id', $userId)->where('delivery_status', 'in_transit')->count(),
            'pending_deliveries' => \App\Models\Delivery::where('user_id', $userId)->where('delivery_status', 'pending')->count(),
        ];

        // Get real recent deliveries from database
        $recentDeliveries = \App\Models\Delivery::with(['client'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($delivery) {
                return [
                    'id' => '#' . $delivery->waybill,
                    'customer' => $delivery->client?->client_name ?? 'Unknown',
                    'delivery_status' => $delivery->delivery_status,
                    'date' => $delivery->created_at->format('Y-m-d'),
                ];
            });

        // Get drivers from database
        $drivers = Driver::with('user')->get()->map(function ($driver) {
            return [
                'id' => $driver->driver_id,
                'name' => $driver->user->firstname . ' ' . $driver->user->lastname,
                'license' => $driver->license_no,
                'status' => $driver->availability_status,
                'active_deliveries' => 0,
                'username' => $driver->user->username,
                'phone' => $driver->user->contact_number,
                'is_active' => $driver->user->is_active,
            ];
        });

        // Get clients from database
        $clients = Client::orderBy('created_at', 'desc')->get();

        return inertia('OperationalManager/Dashboard', [
            'authUser' => Auth::user(),
            'stats' => $stats,
            'recentDeliveries' => $recentDeliveries,
            'drivers' => $drivers,
            'clients' => $clients,
        ]);
    }

    public function profile()
    {
        return inertia('OperationalManager/Profile', [
            'authUser' => Auth::user(),
        ]);
    }

    public function drivers()
    {
        // Get drivers from database with active deliveries count
        $drivers = Driver::with('user')->get()->map(function ($driver) {
            // Count active deliveries for this driver
            $activeDeliveries = \App\Models\Delivery::where('driver_id', $driver->driver_id)
                ->whereIn('delivery_status', ['assigned', 'in_transit'])
                ->count();

            return [
                'id' => $driver->driver_id,
                'name' => $driver->user->firstname . ' ' . $driver->user->lastname,
                'license' => $driver->license_no,
                'status' => $driver->availability_status,
                'active_deliveries' => $activeDeliveries,
                'username' => $driver->user->username,
                'phone' => $driver->user->contact_number,
                'is_active' => $driver->user->is_active,
            ];
        });

        return inertia('OperationalManager/Drivers', [
            'authUser' => Auth::user(),
            'drivers' => $drivers,
        ]);
    }

    public function clients()
    {
        // Get clients from database
        $clients = Client::orderBy('created_at', 'desc')->get();

        return inertia('OperationalManager/Clients', [
            'authUser' => Auth::user(),
            'clients' => $clients,
        ]);
    }

    public function deliveries()
    {
        $user = Auth::user();
        
        // Use user_id instead of manager_id since operation_managers table is deleted
        $userId = $user->user_id;
        
        // Get clients for dropdown
        $clients = Client::orderBy('client_name')->get();
        
        // Get available drivers for dropdown (only 'available' status, not busy or in_transit)
        $drivers = Driver::with('user', 'truck')
            ->where('availability_status', 'available')
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->driver_id,
                    'name' => $driver->user->firstname . ' ' . $driver->user->lastname,
                    'status' => $driver->availability_status,
                    'truck_id' => $driver->truck_id,
                    'truck_capacity' => $driver->truck?->capacity ?? null,
                ];
            });
        
        // Get available trucks for dropdown
        $trucks = \App\Models\Truck::orderBy('plate_number')->get();
        
        // Get recent deliveries for this manager with status 'pending' (waiting for approval)
        $deliveries = \App\Models\Delivery::with(['client', 'driver.user', 'user'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return inertia('OperationalManager/Deliveries', [
            'authUser' => $user,
            'clients' => $clients,
            'drivers' => $drivers,
            'trucks' => $trucks,
            'deliveries' => $deliveries,
        ]);
    }

    public function storeDelivery(Request $request)
    {
        $user = Auth::user();
        
        // Use user_id directly since operation_managers table is deleted
        $userId = $user->user_id;

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,client_id',
            'driver_id' => 'required|exists:drivers,driver_id',
            'truck_id' => 'nullable|exists:trucks,truck_id',
            'item_description' => 'required|string|max:500',
            'waybill' => 'required|string|max:50',
            'weight_tons' => 'required|numeric|min:0.01',
            'pickup_address' => 'required|string|max:500',
            'delivery_address' => 'required|string|max:500',
            'priority' => 'required|in:normal,high,urgent',
            'estimated_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'pickup_coordinates' => 'nullable|string',
            'dropoff_coordinates' => 'nullable|string',
        ]);

        // Parse coordinates if provided
        $pickupLat = null;
        $pickupLng = null;
        $deliveryLat = null;
        $deliveryLng = null;

        if ($validated['pickup_coordinates']) {
            $coords = explode(',', $validated['pickup_coordinates']);
            if (count($coords) === 2) {
                $pickupLat = (float) $coords[0];
                $pickupLng = (float) $coords[1];
            }
        }

        if ($validated['dropoff_coordinates']) {
            $coords = explode(',', $validated['dropoff_coordinates']);
            if (count($coords) === 2) {
                $deliveryLat = (float) $coords[0];
                $deliveryLng = (float) $coords[1];
            }
        }

        // Create delivery with status 'pending' (waiting for admin approval)
        \App\Models\Delivery::create([
            'user_id' => $userId,
            'driver_id' => $validated['driver_id'],
            'client_id' => $validated['client_id'],
            'truck_id' => $validated['truck_id'] ?? null,
            'status' => 'pending',
            'weight_tons' => $validated['weight_tons'],
            'item_description' => $validated['item_description'],
            'waybill' => $validated['waybill'],
            'pickup_address' => $validated['pickup_address'],
            'pickup_latitude' => $pickupLat,
            'pickup_longitude' => $pickupLng,
            'delivery_address' => $validated['delivery_address'],
            'delivery_latitude' => $deliveryLat,
            'delivery_longitude' => $deliveryLng,
            'priority' => $validated['priority'],
            'estimated_delivery_time' => $validated['estimated_delivery_date'] ?? now()->addDays(3),
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('operational_manager.deliveries')->with('success', 'Delivery request sent for approval!');
    }
    public function apiDeliveries(Request $request)
    {
        $user = Auth::user();
        
        $userId = $user->user_id;

        $query = \App\Models\Delivery::with(['client', 'driver.user', 'truck', 'user'])
            ->where('user_id', $userId)
            ->latest();

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('waybill', 'like', "%{$searchTerm}%")
                  ->orWhereHas('client', function ($q) use ($searchTerm) {
                      $q->where('client_name', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('driver.user', function ($q) use ($searchTerm) {
                      $q->where('firstname', 'like', "%{$searchTerm}%")
                        ->orWhere('lastname', 'like', "%{$searchTerm}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('delivery_status', $request->status);
        }

        $deliveries = $query->paginate(10);

        $stats = [
            'total' => \App\Models\Delivery::where('user_id', $userId)->count(),
            'delivered' => \App\Models\Delivery::where('user_id', $userId)->where('delivery_status', 'delivered')->count(),
            'in_transit' => \App\Models\Delivery::where('user_id', $userId)->where('delivery_status', 'in_transit')->count(),
            'pending' => \App\Models\Delivery::where('user_id', $userId)->where('delivery_status', 'pending')->count(),
            'approved' => \App\Models\Delivery::where('user_id', $userId)->where('delivery_status', 'approved')->count(),
            'cancelled' => \App\Models\Delivery::where('user_id', $userId)->where('delivery_status', 'cancelled')->count(),
        ];

        return response()->json([
            'deliveries' => $deliveries->items(),
            'meta' => [
                'current_page' => $deliveries->currentPage(),
                'last_page' => $deliveries->lastPage(),
                'per_page' => $deliveries->perPage(),
                'total' => $deliveries->total(),
            ],
            'stats' => $stats,
        ]);
    }

    public function addClient(Request $request)
    {
        // Validate client data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact' => 'required|string|max:20',
            'address' => 'required|string|max:500',
        ]);

        // Add client logic here
        
        return redirect()->route('operational_manager.dashboard')->with('success', 'Client added successfully!');
    }

    public function recentDeliveries()
    {
        $user = Auth::user();
        $userId = $user->user_id;
        
        // Get all deliveries for this manager
        $deliveries = \App\Models\Delivery::with(['client', 'driver.user', 'truck'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('OperationalManager/RecentDeliveries', [
            'authUser' => $user,
            'deliveries' => $deliveries,
        ]);
    }
}
