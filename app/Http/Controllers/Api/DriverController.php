<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Driver;
use App\Models\MaintenanceReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DriverController extends Controller
{
    /**
     * Get driver profile with status and current delivery
     */
    public function profile(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not authenticated',
                ], 401);
            }

            // Only drivers can access their profile
            if ($user->role !== 'driver') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only drivers can access this endpoint',
                ], 403);
            }

            // Find the driver record
            $driver = Driver::where('user_id', $user->user_id)
                ->with(['user', 'truck'])
                ->first();

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver record not found',
                ], 404);
            }

            // Get current delivery if driver is busy/in_transit
            $currentDelivery = null;
            if (in_array($driver->availability_status, ['busy', 'in_transit'])) {
                $delivery = Delivery::where('driver_id', $driver->driver_id)
                    ->whereIn('delivery_status', ['assigned', 'in_transit'])
                    ->with(['client'])
                    ->orderBy('updated_at', 'desc')
                    ->first();

                if ($delivery) {
                    $currentDelivery = [
                        'delivery_id' => $delivery->delivery_id,
                        'tracking_number' => $delivery->tracking_number,
                        'pickup_address' => $delivery->pickup_address,
                        'delivery_address' => $delivery->delivery_address,
                        'delivery_status' => $delivery->delivery_status,
                        'client_name' => $delivery->client?->company_name ?? $delivery->client?->name ?? 'Unknown',
                    ];
                }
            }

            // Include complete truck information if driver has a truck assigned
            $truckInfo = null;
            if ($driver->truck) {
                $truckInfo = [
                    'truck_id' => $driver->truck->truck_id,
                    'unique_id' => $driver->truck->unique_id,
                    'plate_number' => $driver->truck->plate_number,
                    'vehicle_type' => $driver->truck->vehicle_type,
                    'capacity' => $driver->truck->capacity,
                    'condition' => $driver->truck->condition,
                    'truck_status' => $driver->truck->truck_status,
                    'last_maintenance_date' => $driver->truck->last_maintenance_date,
                    'next_inspection' => $driver->truck->next_inspection,
                    'insurance_status' => $driver->truck->insurance_status,
                ];
            }

            $profile = [
                'driver_id' => $driver->driver_id,
                'user_id' => $driver->user_id,
                'firstname' => $driver->user?->firstname ?? '',
                'lastname' => $driver->user?->lastname ?? '',
                'email' => $driver->user?->email ?? '',
                'phone' => $driver->user?->phone ?? '',
                'status' => $driver->availability_status,
                'current_latitude' => $driver->current_latitude,
                'current_longitude' => $driver->current_longitude,
                'last_location_update' => $driver->last_location_update,
                'truck_id' => $driver->truck_id,
                'vehicle_type' => $driver->truck?->vehicle_type ?? null,
                'license_number' => $driver->license_no,
                'current_delivery_id' => $currentDelivery ? $currentDelivery['delivery_id'] : null,
                'current_delivery' => $currentDelivery,
                'truck' => $truckInfo,
            ];

            return response()->json([
                'success' => true,
                'driver' => $profile,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching driver profile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching driver profile: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get driver status only
     */
    public function status(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'driver') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $driver = Driver::where('user_id', $user->user_id)->first();

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver not found',
                ], 404);
            }

            $completedRescues = \App\Models\RescueRequest::where('driver_id', $driver->driver_id)
                ->where('status', 'resolved')->count();
            $activeRescues = \App\Models\RescueRequest::where('driver_id', $driver->driver_id)
                ->whereIn('status', ['pending', 'assigned', 'en_route', 'arrived'])->count();

            return response()->json([
                'success' => true,
                'status' => $driver->availability_status,
                'driver_id' => $driver->driver_id,
                'rescue_stats' => [
                    'completed' => $completedRescues,
                    'active' => $activeRescues,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching driver status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching driver status',
            ], 500);
        }
    }

    /**
     * Update driver status
     */
    public function updateStatus(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'driver') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'required|in:available,busy,in_transit,off_duty',
            ]);

            $driver = Driver::where('user_id', $user->user_id)->first();

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver not found',
                ], 404);
            }

            $oldStatus = $driver->availability_status;
            $driver->availability_status = $validated['status'];
            $driver->save();

            Log::info('Driver status updated', [
                'driver_id' => $driver->driver_id,
                'user_id' => $user->user_id,
                'old_status' => $oldStatus,
                'new_status' => $validated['status'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'status' => $driver->availability_status,
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating driver status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating driver status',
            ], 500);
        }
    }

    /**
     * Update driver location (GPS coordinates)
     * Called by DRIVER_APP every 5-10 seconds
     */
    public function updateLocation(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'driver') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $validated = $request->validate([
                'current_latitude'  => 'required|numeric|between:-90,90',
                'current_longitude' => 'required|numeric|between:-180,180',
                'current_speed'     => 'nullable|numeric|min:0',
                'heading'           => 'nullable|numeric|min:0|max:360',
                'is_gps_enabled'    => 'nullable|boolean',
                'recorded_at'       => 'nullable|date',
            ]);

            $driver = Driver::where('user_id', $user->user_id)->first();

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver not found',
                ], 404);
            }

            // Update live location on the driver record
            $driver->current_latitude     = $validated['current_latitude'];
            $driver->current_longitude    = $validated['current_longitude'];
            $driver->current_speed        = $validated['current_speed'] ?? 0;
            $driver->is_gps_enabled       = $validated['is_gps_enabled'] ?? true;
            $driver->last_location_update = now();
            $driver->save();

            // Get active delivery for this driver (if any)
            $activeDelivery = \App\Models\Delivery::where('driver_id', $driver->driver_id)
                ->whereIn('delivery_status', ['assigned', 'in_transit'])
                ->first();

            // Append to historical breadcrumb trail
            \App\Models\DriverLocationHistory::create([
                'driver_id'    => $driver->driver_id,
                'delivery_id'  => $activeDelivery?->delivery_id,
                'latitude'     => $validated['current_latitude'],
                'longitude'    => $validated['current_longitude'],
                'speed'        => $validated['current_speed'] ?? 0,
                'heading'      => $validated['heading'] ?? null,
                'is_gps_enabled' => $validated['is_gps_enabled'] ?? true,
                'was_offline'  => false,
                'recorded_at'  => $validated['recorded_at'] ?? now(),
            ]);

            $status = $driver->current_speed > 5 ? 'moving' : 'stopped';

            event(new \App\Events\DriverLocationUpdated(
                $driver->driver_id,
                $driver->current_latitude,
                $driver->current_longitude,
                $driver->current_speed,
                $status,
                $driver->is_gps_enabled,
                $activeDelivery?->delivery_status
            ));

            return response()->json([
                'success' => true,
                'message' => 'Location updated',
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating driver location: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating location',
            ], 500);
        }
    }

    /**
     * Bulk-upload queued offline GPS coordinates (Store and Forward)
     * Called by DRIVER_APP when connectivity is restored after being offline
     */
    public function updateLocationBatch(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'driver') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $driver = Driver::where('user_id', $user->user_id)->first();

            if (!$driver) {
                return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
            }

            $request->validate([
                'locations'                   => 'required|array|min:1|max:500',
                'locations.*.latitude'        => 'required|numeric|between:-90,90',
                'locations.*.longitude'       => 'required|numeric|between:-180,180',
                'locations.*.speed'           => 'nullable|numeric|min:0',
                'locations.*.heading'         => 'nullable|numeric|min:0|max:360',
                'locations.*.is_gps_enabled'  => 'nullable|boolean',
                'locations.*.recorded_at'     => 'required|date',
            ]);

            $activeDelivery = \App\Models\Delivery::where('driver_id', $driver->driver_id)
                ->whereIn('delivery_status', ['assigned', 'in_transit'])
                ->first();

            $records = collect($request->locations)->map(function ($loc) use ($driver, $activeDelivery) {
                return [
                    'driver_id'      => $driver->driver_id,
                    'delivery_id'    => $activeDelivery?->delivery_id,
                    'latitude'       => $loc['latitude'],
                    'longitude'      => $loc['longitude'],
                    'speed'          => $loc['speed'] ?? 0,
                    'heading'        => $loc['heading'] ?? null,
                    'is_gps_enabled' => $loc['is_gps_enabled'] ?? true,
                    'was_offline'    => true, // mark these as queued offline points
                    'recorded_at'    => $loc['recorded_at'],
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ];
            })->toArray();

            \App\Models\DriverLocationHistory::insert($records);

            // Update driver's live location to the most recent point
            $latest = collect($request->locations)->sortByDesc('recorded_at')->first();
            if ($latest) {
                $driver->current_latitude     = $latest['latitude'];
                $driver->current_longitude    = $latest['longitude'];
                $driver->current_speed        = $latest['speed'] ?? 0;
                $driver->last_location_update = now();
                $driver->save();

                $status = ($latest['speed'] ?? 0) > 5 ? 'moving' : 'stopped';

                event(new \App\Events\DriverLocationUpdated(
                    $driver->driver_id,
                    $latest['latitude'],
                    $latest['longitude'],
                    $latest['speed'] ?? 0,
                    $status,
                    $latest['is_gps_enabled'] ?? true,
                    $activeDelivery?->delivery_status
                ));
            }

            Log::info('Offline batch location upload', [
                'driver_id' => $driver->driver_id,
                'count'     => count($records),
            ]);

            return response()->json([
                'success' => true,
                'message' => count($records) . ' offline locations synced',
                'synced'  => count($records),
            ]);

        } catch (\Exception $e) {
            Log::error('Error batch uploading locations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error syncing offline locations',
            ], 500);
        }
    }

    /**
     * Get a driver's historical path (for Admin Dashboard map & Replay Center)
     */
    public function getLocationHistory(Request $request, $driverId)
    {
        try {
            $query = \App\Models\DriverLocationHistory::where('driver_id', $driverId)
                ->orderBy('recorded_at', 'asc');

            if ($request->has('delivery_id')) {
                // If a specific delivery is requested (Replay Center), fetch exact path for that delivery
                $query->where('delivery_id', $request->delivery_id);
            } else {
                // Otherwise (Live Routes map), just fetch recent history based on hours
                $hours = $request->get('hours', 8); // Default last 8 hours
                $query->where('recorded_at', '>=', now()->subHours($hours));
            }

            $history = $query->get(['latitude', 'longitude', 'speed', 'was_offline', 'recorded_at']);

            return response()->json([
                'success' => true,
                'path'    => $history,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching location history: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error fetching path'], 500);
        }
    }

    /**
     * Submit maintenance report from driver
     */
    public function submitMaintenanceReport(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'driver') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only drivers can submit maintenance reports',
                ], 403);
            }

            $validated = $request->validate([
                'truckId' => 'required|integer|exists:trucks,truck_id',
                'issueTitle' => 'required|string|max:255',
                'issueDescription' => 'required|string|min:10',
                'priorityLevel' => 'required|in:low,medium,high,emergency',
            ]);

            // Find the driver record
            $driver = Driver::where('user_id', $user->user_id)->first();

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver record not found',
                ], 404);
            }

            // Create maintenance report
            $maintenanceReport = MaintenanceReport::create([
                'driver_id' => $driver->driver_id,
                'truck_id' => $driver->truck_id,
                'issue_title' => $validated['issueTitle'],
                'issue_description' => $validated['issueDescription'],
                'priority_level' => $validated['priorityLevel'],
                'status' => 'pending',
            ]);

            Log::info('Maintenance report submitted', [
                'report_id' => $maintenanceReport->id,
                'driver_id' => $driver->driver_id,
                'truck_id' => $driver->truck_id,
                'issue_title' => $validated['issueTitle'],
                'priority' => $validated['priorityLevel'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Maintenance report submitted successfully',
                'report' => [
                    'id' => $maintenanceReport->id,
                    'issue_title' => $maintenanceReport->issue_title,
                    'status' => $maintenanceReport->status,
                    'priority_level' => $maintenanceReport->priority_level,
                    'created_at' => $maintenanceReport->created_at->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error submitting maintenance report: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error submitting maintenance report: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all drivers with their status (for admin/operation manager)
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || !in_array($user->role, ['admin', 'operation_manager'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $drivers = Driver::with(['user', 'truck', 'deliveries' => function($query) {
                $query->whereIn('delivery_status', ['assigned', 'in_transit'])->limit(1);
            }])->get();

            $formattedDrivers = $drivers->map(function($driver) {
                $currentDelivery = $driver->deliveries->first();

                return [
                    'driver_id' => $driver->driver_id,
                    'name' => $driver->user?->firstname . ' ' . $driver->user?->lastname,
                    'email' => $driver->user?->email,
                    'phone' => $driver->user?->phone,
                    'status' => $driver->availability_status,
                    'vehicle_type' => $driver->truck?->vehicle_type,
                    'license_no' => $driver->license_no,
                    'current_delivery' => $currentDelivery ? [
                        'delivery_id' => $currentDelivery->delivery_id,
                        'tracking_number' => $currentDelivery->tracking_number,
                        'delivery_status' => $currentDelivery->delivery_status,
                    ] : null,
                    'is_available' => $driver->availability_status === 'available',
                ];
            });

            return response()->json([
                'success' => true,
                'drivers' => $formattedDrivers,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching drivers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching drivers',
            ], 500);
        }
    }

    /**
     * Get driver's maintenance reports
     */
    public function getMaintenanceReports(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not authenticated',
                ], 401);
            }

            // Only drivers can access their maintenance reports
            if ($user->role !== 'driver') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only drivers can access this endpoint',
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

            // Get driver's maintenance reports with truck info and maintenance schedule
            $reports = MaintenanceReport::where('driver_id', $driver->driver_id)
                ->with(['truck', 'maintenance'])
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedReports = $reports->map(function($report) {
                // Generate notification title and message based on status
                $notificationTitle = '';
                $notificationMessage = '';
                $notificationType = 'maintenance';
                $scheduledDate = null;
                $scheduledTime = null;
                $location = null;
                $estimatedDuration = null;
                $notificationStatus = 'unread';

                switch ($report->status) {
                    case 'approved':
                        $notificationTitle = 'Truck Maintenance Scheduled';
                        $notificationMessage = 'Your truck has been scheduled for maintenance. ' . $report->issue_title;
                        $notificationType = 'schedule';
                        // Get maintenance schedule details if available
                        if ($report->maintenance) {
                            $scheduledDate = $report->maintenance->repair_date?->format('M d, Y');
                            $scheduledTime = $report->maintenance->repair_time;
                            $location = $report->maintenance->repair_location;
                        }
                        $notificationStatus = 'unread';
                        break;
                    case 'in_progress':
                        $notificationTitle = 'Maintenance In Progress';
                        $notificationMessage = 'Your truck maintenance is currently in progress. ' . $report->issue_title;
                        $notificationType = 'maintenance';
                        $notificationStatus = 'unread';
                        break;
                    case 'completed':
                        $notificationTitle = 'Maintenance Completed';
                        $notificationMessage = 'Your truck maintenance has been completed. Vehicle is ready for pickup.';
                        $notificationType = 'general';
                        $notificationStatus = 'unread';
                        break;
                    default:
                        $notificationTitle = 'Maintenance Report';
                        $notificationMessage = $report->issue_title;
                        $notificationType = 'general';
                        $notificationStatus = 'read';
                        break;
                }

                return [
                    'id' => $report->id,
                    'issue_title' => $report->issue_title,
                    'issue_description' => $report->issue_description,
                    'priority_level' => $report->priority_level,
                    'status' => $report->status,
                    'created_at' => $report->created_at,
                    'truck_id' => $report->truck_id,
                    'unique_id' => $report->truck?->unique_id,
                    'truck' => [
                        'plate_number' => $report->truck?->plate_number,
                        'vehicle_type' => $report->truck?->vehicle_type,
                    ],
                    'mechanic' => $report->mechanic_name,
                    // Notification fields
                    'notification_title' => $notificationTitle,
                    'notification_message' => $notificationMessage,
                    'notification_type' => $notificationType,
                    'scheduled_date' => $scheduledDate,
                    'scheduled_time' => $scheduledTime,
                    'location' => $location,
                    'estimated_duration' => $estimatedDuration,
                    'notification_status' => $notificationStatus,
                ];
            });

            return response()->json([
                'success' => true,
                'reports' => $formattedReports,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching maintenance reports: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching maintenance reports',
            ], 500);
        }
    }
}
