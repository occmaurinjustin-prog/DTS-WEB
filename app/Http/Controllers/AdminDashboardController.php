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
        // Get today's date for filtering
        $today = now()->startOfDay();
        
        // Maintenance statistics
        $maintenanceStats = [
            'pending_maintenance' => \App\Models\MaintenanceReport::where('status', 'pending')->count(),
            'in_progress_maintenance' => \App\Models\MaintenanceReport::where('status', 'in_progress')->count(),
            'completed_maintenance_today' => \App\Models\MaintenanceReport::where('status', 'completed')
                ->where('updated_at', '>=', $today)->count(),
            'urgent_repairs' => \App\Models\MaintenanceReport::where('priority_level', 'urgent')
                ->where('status', '!=', 'completed')->count(),
        ];

        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_clients' => Client::count(),
            'total_drivers' => Driver::count(),
            'active_drivers' => Driver::where('availability_status', 'available')->count(),
            'total_trucks' => \App\Models\Truck::count(),
            'available_trucks' => \App\Models\Truck::where('truck_status', 'available')->count(),
            'total_deliveries' => Delivery::count(),
            'pending_deliveries' => Delivery::where('delivery_status', 'pending')->count(),
            'in_transit_deliveries' => Delivery::where('delivery_status', 'in_transit')->count(),
            'delivered_deliveries' => Delivery::where('delivery_status', 'delivered')->count(),
            'cancelled_deliveries' => Delivery::where('delivery_status', 'cancelled')->count(),
            'today_deliveries' => Delivery::where('created_at', '>=', $today)->count(),
            'total_inquiries' => 0, // Inquiries table deleted
            'open_inquiries' => 0,
        ];

        // Merge maintenance stats with main stats
        $stats = array_merge($stats, $maintenanceStats);

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

    public function driverStops()
    {
        return inertia('Admin/DriverStops');
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

    public function apiUsers(Request $request)
    {
        $query = User::latest('created_at');

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('firstname', 'like', "%{$searchTerm}%")
                  ->orWhere('lastname', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('username', 'like', "%{$searchTerm}%")
                  ->orWhere('contact_number', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        return response()->json($query->paginate(10));
    }

    public function deliveries()
    {
        $pendingDeliveries = Delivery::with(['client', 'driver.user', 'truck', 'user'])
            ->where('delivery_status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Admin/Deliveries', [
            'authUser' => Auth::user(),
            'pendingDeliveries' => $pendingDeliveries,
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function apiDeliveries(Request $request)
    {
        $query = Delivery::with(['client', 'driver.user', 'truck', 'user'])
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
            'total' => Delivery::count(),
            'delivered' => Delivery::where('delivery_status', 'delivered')->count(),
            'in_transit' => Delivery::where('delivery_status', 'in_transit')->count(),
            'pending' => Delivery::where('delivery_status', 'pending')->count(),
            'approved' => Delivery::where('delivery_status', 'approved')->count(),
            'cancelled' => Delivery::where('delivery_status', 'cancelled')->count(),
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
                    'isGpsEnabled' => (bool) $driver->is_gps_enabled,
                    // Current delivery info with status
                    'delivery' => $currentDelivery ? [
                        'id' => $currentDelivery->delivery_id,
                        'tracking' => $currentDelivery->waybill,
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

    public function reports(Request $request)
    {
        $dateRange = $request->get('dateRange', 'today');
        $dateFilter = $this->getDateFilter($dateRange);

        // Get delivery statistics
        $deliveryQuery = Delivery::where(function($query) use ($dateFilter) {
            if ($dateFilter) {
                $query->where('created_at', '>=', $dateFilter);
            }
        });

        $deliveryStats = [
            'total' => $deliveryQuery->count(),
            'completed' => $deliveryQuery->where('delivery_status', 'delivered')->count(),
            'pending' => $deliveryQuery->where('delivery_status', 'pending')->count(),
            'in_transit' => $deliveryQuery->where('delivery_status', 'in_transit')->count(),
            'assigned' => $deliveryQuery->where('delivery_status', 'assigned')->count(),
        ];

        // Get driver statistics
        $driverStats = [
            'total' => Driver::count(),
            'active' => Driver::where('availability_status', 'available')->count(),
            'on_leave' => Driver::where('availability_status', 'on_leave')->count(),
            'busy' => Driver::where('availability_status', 'busy')->count(),
        ];

        // Get truck statistics
        $truckStats = [
            'total' => \App\Models\Truck::count(),
            'available' => \App\Models\Truck::where('truck_status', 'available')->count(),
            'in_maintenance' => \App\Models\Truck::where('truck_status', 'in_maintenance')->count(),
            'in_use' => \App\Models\Truck::where('truck_status', 'in_use')->count(),
        ];

        // Get maintenance statistics
        $maintenanceQuery = \App\Models\MaintenanceReport::where(function($query) use ($dateFilter) {
            if ($dateFilter) {
                $query->where('created_at', '>=', $dateFilter);
            }
        });

        $maintenanceStats = [
            'total' => \App\Models\Maintenance::count(),
            'completed' => $maintenanceQuery->where('status', 'completed')->count(),
            'pending' => $maintenanceQuery->where('status', 'pending')->count(),
            'in_progress' => $maintenanceQuery->where('status', 'in_progress')->count(),
        ];

        // Get user statistics
        $userStats = [
            'total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'office_staff' => User::where('role', 'office_staff')->count(),
            'operation_managers' => User::where('role', 'operation_manager')->count(),
        ];

        // Get real delivery data for reports
        $deliveryData = Delivery::with(['client', 'driver.user'])
            ->where(function($query) use ($dateFilter) {
                if ($dateFilter) {
                    $query->where('created_at', '>=', $dateFilter);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($delivery) {
                return [
                    'id' => $delivery->delivery_id,
                    'waybill' => $delivery->waybill,
                    'customer' => $delivery->client ? $delivery->client->client_name : 'Unknown',
                    'status' => $delivery->delivery_status,
                    'pickup_address' => $delivery->pickup_address,
                    'destination_address' => $delivery->delivery_address,
                    'created_at' => $delivery->created_at->format('Y-m-d'),
                    'weight' => $delivery->weight_tons,
                    'driver' => $delivery->driver ? $delivery->driver->user->name : 'Unassigned',
                ];
            });

        // Get real maintenance data for reports
        $maintenanceData = \App\Models\MaintenanceReport::with(['maintenance'])
            ->where(function($query) use ($dateFilter) {
                if ($dateFilter) {
                    $query->where('created_at', '>=', $dateFilter);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($report) {
                // Get parts from inventory if there's a relationship
                $partsList = 'No parts recorded';
                
                // Try to get parts from different possible relationships
                if (isset($report->parts_used) && $report->parts_used) {
                    $partsList = $report->parts_used;
                } elseif ($report->maintenance && isset($report->maintenance->parts_used) && $report->maintenance->parts_used) {
                    $partsList = $report->maintenance->parts_used;
                } elseif ($report->maintenance && $report->maintenance->inventory && $report->maintenance->inventory->isNotEmpty()) {
                    $partsList = $report->maintenance->inventory->pluck('part_name')->implode(', ');
                }
                
                // Get truck information directly from truck_id
                $truckPlate = 'Unknown';
                $vehicleType = 'Unknown';
                if ($report->truck_id) {
                    $truck = \App\Models\Truck::find($report->truck_id);
                    $truckPlate = $truck ? $truck->plate_number : 'Unknown';
                    $vehicleType = $truck ? $truck->vehicle_type : 'Unknown';
                }
                
                return [
                    'id' => $report->id,
                    'report_id' => 'RPT-' . $report->id,
                    'truck_id' => $report->truck_id ?? 'Unknown',
                    'truck_plate' => $truckPlate,
                    'vehicle_type' => $vehicleType,
                    'issue_title' => $report->issue_title ?? 'General Maintenance',
                    'parts_used' => $partsList ?: 'No parts recorded',
                    'status' => $report->status ?? 'pending',
                    'report_date' => $report->created_at->format('Y-m-d'),
                    'description' => $report->description ?? 'No description',
                ];
            });

        return inertia('Admin/Reports', [
            'authUser' => Auth::user(),
            'deliveryStats' => $deliveryStats,
            'driverStats' => $driverStats,
            'truckStats' => $truckStats,
            'maintenanceStats' => $maintenanceStats,
            'userStats' => $userStats,
            'deliveryData' => $deliveryData,
            'maintenanceData' => $maintenanceData,
        ]);
    }

    /**
     * Get date filter based on selected range
     */
    private function getDateFilter($range)
    {
        $now = now();
        
        switch ($range) {
            case 'today':
                return $now->startOfDay();
            case 'week':
                return $now->startOfWeek();
            case 'month':
                return $now->startOfMonth();
            case 'year':
                return $now->startOfYear();
            default:
                return null;
        }
    }

    /**
     * API for Drivers with Pagination and Filtering
     */
    public function apiDrivers(Request $request)
    {
        $query = Driver::with('user')->latest();

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('license_no', 'like', "%{$searchTerm}%")
                  ->orWhereHas('user', function ($q) use ($searchTerm) {
                      $q->where('firstname', 'like', "%{$searchTerm}%")
                        ->orWhere('lastname', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%")
                        ->orWhere('contact_number', 'like', "%{$searchTerm}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('availability_status', $request->status);
        }

        $drivers = $query->paginate(10);

        $stats = [
            'total' => Driver::count(),
            'available' => Driver::where('availability_status', 'available')->count(),
            'busy' => Driver::where('availability_status', 'busy')->count(),
            'in_transit' => Driver::where('availability_status', 'in_transit')->count(),
            'off_duty' => Driver::where('availability_status', 'off_duty')->count(),
            'on_duty' => Driver::where('availability_status', 'on_duty')->count(),
            'on_leave' => Driver::where('availability_status', 'on_leave')->count(),
        ];

        return response()->json([
            'drivers' => $drivers->items(),
            'meta' => [
                'current_page' => $drivers->currentPage(),
                'last_page' => $drivers->lastPage(),
                'per_page' => $drivers->perPage(),
                'total' => $drivers->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Get delivery statistics by time period
     */
    public function getDeliveryStats(Request $request)
    {
        $period = $request->input('period', 'week'); // 'day', 'week', 'month'
        $now = now();
        $data = [];

        if ($period === 'day') {
            // Last 24 hours by hour
            for ($i = 23; $i >= 0; $i--) {
                $hourStart = $now->copy()->subHours($i)->startOfHour();
                $hourEnd = $hourStart->copy()->endOfHour();
                
                $count = Delivery::whereBetween('created_at', [$hourStart, $hourEnd])->count();
                
                $data[] = [
                    'name' => $hourStart->format('H:00'),
                    'value' => $count,
                ];
            }
        } elseif ($period === 'week') {
            // Last 7 days
            $days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for ($i = 6; $i >= 0; $i--) {
                $dayStart = $now->copy()->subDays($i)->startOfDay();
                $dayEnd = $dayStart->copy()->endOfDay();
                
                $count = Delivery::whereBetween('created_at', [$dayStart, $dayEnd])->count();
                
                $data[] = [
                    'name' => $days[$dayStart->dayOfWeek],
                    'value' => $count,
                ];
            }
        } elseif ($period === 'month') {
            // Last 4 weeks
            for ($i = 3; $i >= 0; $i--) {
                $weekStart = $now->copy()->subWeeks($i)->startOfWeek();
                $weekEnd = $weekStart->copy()->endOfWeek();
                
                $count = Delivery::whereBetween('created_at', [$weekStart, $weekEnd])->count();
                
                $data[] = [
                    'name' => 'Week ' . (4 - $i),
                    'value' => $count,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
