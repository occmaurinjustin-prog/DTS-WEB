<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DriverStop;
use App\Models\Driver;
use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DriverStopController extends Controller
{
    /**
     * Start recording a driver stop.
     * Called by the mobile app when the driver has stopped moving.
     */
    public function start(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'driver') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $driver = Driver::where('user_id', $user->user_id)->first();
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        // Validate the request
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'address' => 'nullable|string',
            'stopped_at' => 'nullable|date',
        ]);

        $stoppedAt = $request->filled('stopped_at') ? Carbon::parse($request->stopped_at) : Carbon::now();

        // Find active delivery for the driver to associate with the stop
        $activeDelivery = Delivery::where('driver_id', $driver->driver_id)
            ->whereIn('delivery_status', ['assigned', 'in_transit'])
            ->first();

        // Check if there is already an active stop (resumed_at is null)
        $activeStop = DriverStop::where('driver_id', $driver->driver_id)
            ->whereNull('resumed_at')
            ->first();

        if ($activeStop) {
            // Already have an active stop, don't create a duplicate. 
            // Return it so frontend knows the ID if it needs it.
            return response()->json([
                'success' => true,
                'message' => 'Stop already active',
                'data' => $activeStop
            ]);
        }

        // Create a new stop
        $stop = DriverStop::create([
            'driver_id' => $driver->driver_id,
            'delivery_id' => $activeDelivery ? $activeDelivery->delivery_id : null,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'address' => $validated['address'] ?? null,
            'stopped_at' => $stoppedAt,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stop recorded',
            'data' => $stop
        ]);
    }

    /**
     * End a driver stop.
     * Called by the mobile app when the driver starts moving again.
     */
    public function end(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'driver') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $driver = Driver::where('user_id', $user->user_id)->first();
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        // Find active stop
        $activeStop = DriverStop::where('driver_id', $driver->driver_id)
            ->whereNull('resumed_at')
            ->first();

        if (!$activeStop) {
            return response()->json([
                'success' => false,
                'message' => 'No active stop found'
            ], 404);
        }

        $resumedAt = $request->filled('resumed_at') ? Carbon::parse($request->resumed_at) : Carbon::now();
        
        // Ensure resumed_at is after stopped_at
        if ($resumedAt->lessThan($activeStop->stopped_at)) {
            $resumedAt = Carbon::now();
        }

        $durationMinutes = (int) $activeStop->stopped_at->diffInMinutes($resumedAt);

        $activeStop->update([
            'resumed_at' => $resumedAt,
            'duration_minutes' => $durationMinutes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stop ended',
            'data' => $activeStop
        ]);
    }

    /**
     * Get all driver stops for admin dashboard.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user || !in_array($user->role, ['admin', 'operation_manager'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $query = DriverStop::with(['driver.user', 'delivery.client', 'driver.truck'])
            ->orderBy('stopped_at', 'desc');

        if ($request->filled('search')) {
            $searchTerms = array_filter(explode(' ', $request->search));
            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->where(function ($q2) use ($term) {
                        $q2->whereHas('driver.user', function ($q3) use ($term) {
                            $q3->where('firstname', 'like', "%{$term}%")
                              ->orWhere('lastname', 'like', "%{$term}%")
                              ->orWhere('middle_name', 'like', "%{$term}%");
                        })->orWhereHas('delivery', function ($q3) use ($term) {
                            $q3->where('waybill', 'like', "%{$term}%");
                        });
                    });
                }
            });
        }

        if ($request->filled('date') && $request->date !== 'all') {
            $query->whereDate('stopped_at', Carbon::parse($request->date)->format('Y-m-d'));
        }

        $perPage = $request->get('per_page', 10);
        $stops = $query->paginate($perPage);

        // Stats
        $todayStart = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();

        $totalToday = DriverStop::where('stopped_at', '>=', $todayStart)->count();
        $totalWeek = DriverStop::where('stopped_at', '>=', $weekStart)->count();
        $avgDuration = (int) DriverStop::whereNotNull('duration_minutes')->avg('duration_minutes');
        
        $mostStopsDriver = DriverStop::selectRaw('driver_id, count(*) as stop_count')
            ->groupBy('driver_id')
            ->orderByDesc('stop_count')
            ->with('driver.user')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $stops,
            'stats' => [
                'totalToday' => $totalToday,
                'totalWeek' => $totalWeek,
                'avgDuration' => $avgDuration,
                'mostStopsDriver' => $mostStopsDriver ? $mostStopsDriver->driver->user->firstname . ' ' . $mostStopsDriver->driver->user->lastname : 'N/A'
            ]
        ]);
    }
}
