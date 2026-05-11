<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\Truck;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                \Log::error('No authenticated user found - Auth::user() returned null');
                return response()->json([
                    'success' => false,
                    'message' => 'Not authenticated - Please login again',
                ], 401);
            }
            
            \Log::info('Fetching deliveries for user', ['user_id' => $user->user_id, 'role' => $user->role]);
            
            if ($user->role === 'driver') {
                // Find the driver record by user_id
                $driver = \App\Models\Driver::where('user_id', $user->user_id)->first();
                
                \Log::info('Driver lookup', ['driver_found' => $driver ? true : false, 'driver_id' => $driver?->driver_id]);
                
                if (!$driver) {
                    return response()->json([
                        'success' => true,
                        'deliveries' => [],
                    ]);
                }
                
                // Build query with driver_id filter
                $query = Delivery::where('driver_id', $driver->driver_id)
                    ->orderBy('created_at', 'desc');
                
                // Only eager load relationships that exist
                try {
                    $query->with(['client', 'truck', 'user', 'driver.user']);
                } catch (\Exception $e) {
                    \Log::warning('Some relationships not found, loading without eager load');
                }
                
                $deliveries = $query->get();
                    
                \Log::info('Deliveries fetched', ['count' => $deliveries->count()]);
            } elseif ($user->role === 'operation_manager') {
                $deliveries = Delivery::with(['client', 'truck', 'driver'])
                    ->where('user_id', $user->user_id)
                    ->orderBy('created_at', 'desc')
                    ->get();
            } elseif ($user->role === 'admin') {
                $deliveries = Delivery::with(['client', 'truck', 'user'])
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Ensure coordinates are included in response
            $deliveriesWithCoords = $deliveries->map(function($delivery) {
                return [
                    'delivery_id' => $delivery->delivery_id,
                    'tracking_number' => $delivery->tracking_number,
                    'delivery_status' => $delivery->delivery_status,
                    'navigation_phase' => $delivery->navigation_phase ?? 'pickup',
                    'pickup_address' => $delivery->pickup_address,
                    'pickup_latitude' => $delivery->pickup_latitude,
                    'pickup_longitude' => $delivery->pickup_longitude,
                    'delivery_address' => $delivery->delivery_address,
                    'delivery_latitude' => $delivery->delivery_latitude,
                    'delivery_longitude' => $delivery->delivery_longitude,
                    'weight_tons' => $delivery->weight_tons,
                    'item_description' => $delivery->item_description,
                    'client' => $delivery->client,
                    'driver' => $delivery->driver,
                    'truck' => $delivery->truck,
                    'created_at' => $delivery->created_at,
                ];
            });

            return response()->json([
                'success' => true,
                'deliveries' => $deliveriesWithCoords,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching deliveries', [
                'error' => $e->getMessage(), 
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'operation_manager') {
            return response()->json([
                'success' => false,
                'message' => 'Only operation managers can create deliveries',
            ], 403);
        }

        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,driver_id',
            'truck_id' => 'required|exists:trucks,truck_id',
            'client_id' => 'required|exists:clients,client_id',
            'weight_tons' => 'required|numeric|min:0',
            'item_description' => 'required|string',
        ]);

        $delivery = Delivery::create([
            'user_id' => $user->user_id,
            'driver_id' => $validated['driver_id'],
            'truck_id' => $validated['truck_id'],
            'client_id' => $validated['client_id'],
            'weight_tons' => $validated['weight_tons'],
            'item_description' => $validated['item_description'],
            'tracking_number' => 'DTS-' . strtoupper(uniqid()),
            'delivery_status' => 'pending',
        ]);

        Log::info('Delivery created', [
            'delivery_id' => $delivery->delivery_id,
            'user_id' => $user->user_id,
            'driver_id' => $validated['driver_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery created',
            'delivery' => $delivery,
        ]);
    }


    public function show($id)
    {
        $user = Auth::user();
        $delivery = Delivery::with(['client', 'truck', 'manager', 'driver'])
            ->findOrFail($id);

        // Check if user has access to this delivery
        if ($user->role === 'driver' && $delivery->driver_id !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($user->role === 'operation_manager' && $delivery->manager_id !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'delivery' => $delivery,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'driver') {
            return response()->json([
                'success' => false,
                'message' => 'Only drivers can update delivery status',
            ], 403);
        }

        $validated = $request->validate([
            'delivery_status' => 'required|in:pending,assigned,in_transit,delivered,cancelled',
            'navigation_phase' => 'nullable|in:pickup,delivery',
        ]);

        // Find the driver record by user_id
        $driver = \App\Models\Driver::where('user_id', $user->user_id)->first();
        
        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver record not found',
            ], 404);
        }

        $delivery = Delivery::where('driver_id', $driver->driver_id)
            ->where('delivery_id', $id)
            ->first();
            
        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found or not assigned to this driver',
            ], 404);
        }

        $oldStatus = $delivery->delivery_status;
        $delivery->delivery_status = $validated['delivery_status'];
        
        // Update navigation_phase if provided (for pickup/delivery tracking)
        if (isset($validated['navigation_phase'])) {
            $delivery->navigation_phase = $validated['navigation_phase'];
        }
        
        $delivery->save();

        // Update driver availability status based on delivery status
        $this->updateDriverStatusBasedOnDelivery($driver, $validated['delivery_status'], $delivery->delivery_id);

        Log::info('Delivery status updated', [
            'delivery_id' => $delivery->delivery_id,
            'driver_id' => $user->user_id,
            'old_status' => $oldStatus,
            'new_status' => $validated['delivery_status'],
            'navigation_phase' => $delivery->navigation_phase ?? 'pickup',
            'driver_availability' => $driver->fresh()->availability_status,
        ]);

        // TODO: Send real-time notification to admin/manager

        return response()->json([
            'success' => true,
            'message' => 'Delivery status updated',
            'delivery' => $delivery,
        ]);
    }

    /**
     * Update driver availability status based on delivery status
     */
    private function updateDriverStatusBasedOnDelivery(Driver $driver, string $deliveryStatus, ?int $currentDeliveryId = null): void
    {
        $newStatus = match($deliveryStatus) {
            'in_transit' => 'in_transit',
            'assigned' => 'busy',
            default => null, // Handle delivered/cancelled below
        };

        // For delivered/cancelled, check if driver has other active deliveries
        if ($newStatus === null) {
            $activeDeliveriesQuery = Delivery::where('driver_id', $driver->driver_id)
                ->whereIn('delivery_status', ['assigned', 'in_transit']);

            // Exclude the current delivery being updated
            if ($currentDeliveryId) {
                $activeDeliveriesQuery->where('delivery_id', '!=', $currentDeliveryId);
            }

            $hasOtherActiveDeliveries = $activeDeliveriesQuery->exists();

            // Only set to available if no other active deliveries
            $newStatus = $hasOtherActiveDeliveries ? 'busy' : 'available';

            Log::info('Driver delivery completion check', [
                'driver_id' => $driver->driver_id,
                'current_delivery_id' => $currentDeliveryId,
                'delivery_status' => $deliveryStatus,
                'has_other_active' => $hasOtherActiveDeliveries,
                'calculated_status' => $newStatus,
            ]);
        }

        if ($newStatus !== $driver->availability_status) {
            $driver->availability_status = $newStatus;
            $driver->save();

            Log::info('Driver availability status auto-updated', [
                'driver_id' => $driver->driver_id,
                'delivery_status' => $deliveryStatus,
                'new_availability' => $newStatus,
            ]);
        }
    }

    /**
     * Get driver's routes - grouped deliveries for route planning
     */
    public function getRoutes(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'driver') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only drivers can access routes',
                ], 403);
            }

            // Find the driver record
            $driver = Driver::where('user_id', $user->user_id)->first();
            
            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver record not found',
                ], 404);
            }

            // Check if sent_to_driver_at column exists
            $hasSentToDriverAt = Schema::hasColumn('deliveries', 'sent_to_driver_at');
            
            // Get date filter (default to today)
            $date = $request->get('date', now()->toDateString());
            
            // Debug: get all driver deliveries count
            $allCount = Delivery::where('driver_id', $driver->driver_id)->count();
            $pendingCount = Delivery::where('driver_id', $driver->driver_id)->where('delivery_status', 'pending')->count();
            
            // Build query - same as deliveries index (no status filter for driver)
            $query = Delivery::with(['client', 'truck'])
                ->where('driver_id', $driver->driver_id);
            
            if ($hasSentToDriverAt) {
                $query->orderBy('sent_to_driver_at', 'desc');
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            $deliveries = $query->get();

            // Group deliveries into routes by date
            $routes = [];
            $groupedByDate = $deliveries->groupBy(function($delivery) use ($hasSentToDriverAt) {
                if ($hasSentToDriverAt && $delivery->sent_to_driver_at) {
                    return \Carbon\Carbon::parse($delivery->sent_to_driver_at)->toDateString();
                }
                return $delivery->created_at->toDateString();
            });

            foreach ($groupedByDate as $routeDate => $dateDeliveries) {
                // Calculate route stats
                $totalStops = $dateDeliveries->count();
                $completedStops = $dateDeliveries->where('delivery_status', 'delivered')->count();
                $inProgress = $dateDeliveries->where('delivery_status', 'in_transit')->count();
                
                // Calculate estimated time (30 mins per stop + travel time)
                $estimatedMinutes = $totalStops * 30 + ($totalStops - 1) * 15;
                $estimatedHours = floor($estimatedMinutes / 60);
                $estimatedMins = $estimatedMinutes % 60;
                $estimatedTime = $estimatedHours > 0 ? "{$estimatedHours}h {$estimatedMins}m" : "{$estimatedMins}m";
                
                // Calculate total distance (estimated 5km per stop on average)
                $estimatedDistance = $totalStops * 5;

                $route = [
                    'id' => 'route_' . $routeDate,
                    'name' => $routeDate === now()->toDateString() ? 'Today\'s Route' : 'Route ' . $routeDate,
                    'date' => $routeDate,
                    'total_stops' => $totalStops,
                    'completed_stops' => $completedStops,
                    'in_progress' => $inProgress,
                    'status' => $completedStops === $totalStops ? 'completed' : ($inProgress > 0 ? 'in_progress' : 'pending'),
                    'estimated_time' => $estimatedTime,
                    'total_distance' => $estimatedDistance . ' km',
                    'start_address' => $dateDeliveries->first()?->pickup_address ?? 'Warehouse',
                    'end_address' => $dateDeliveries->last()?->delivery_address ?? 'Warehouse',
                    'stops' => $dateDeliveries->map(function($delivery, $index) {
                        return [
                            'id' => $delivery->delivery_id,
                            'sequence' => $index + 1,
                            'type' => $index === 0 ? 'pickup' : 'delivery',
                            'address' => $delivery->pickup_address,
                            'delivery_address' => $delivery->delivery_address,
                            'customer' => $delivery->client->company_name ?? $delivery->client->name ?? 'Unknown',
                            'contact' => $delivery->client->phone ?? 'N/A',
                            'delivery_status' => $delivery->delivery_status,
                            'estimated_arrival' => $delivery->created_at->addMinutes($index * 45)->format('g:i A'),
                            'weight' => $delivery->weight_tons . ' tons',
                            'tracking_number' => $delivery->tracking_number,
                        ];
                    })->toArray()
                ];

                $routes[] = $route;
            }

            // Sort by date, newest first
            usort($routes, function($a, $b) {
                return strcmp($b['date'], $a['date']);
            });

            return response()->json([
                'success' => true,
                'routes' => $routes,
                'total_routes' => count($routes),
                'debug' => [
                    'driver_id' => $driver->driver_id,
                    'total_driver_deliveries' => $allCount,
                    'pending_count' => $pendingCount,
                    'filtered_count' => $deliveries->count(),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getRoutes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching routes: ' . $e->getMessage(),
            ], 500);
        }
    }
}
