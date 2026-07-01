<?php

namespace App\Http\Controllers;

use App\Models\Truck;
use App\Models\Driver;
use Illuminate\Http\Request;

class TruckController extends Controller
{
    public function index()
    {
        $trucks = Truck::orderBy('created_at', 'desc')->paginate(10);
        
        $stats = [
            'total' => Truck::count(),
            'available' => Truck::where('truck_status', 'available')->count(),
            'in_use' => Truck::where('truck_status', 'in_use')->count(),
            'maintenance' => Truck::where('truck_status', 'maintenance')->count(),
        ];
        
        // Get drivers with no truck assigned (available for assignment)
        $availableDrivers = Driver::whereNull('truck_id')
            ->with('user')
            ->get()
            ->map(function ($driver) {
                return [
                    'driver_id' => $driver->driver_id,
                    'first_name' => $driver->user ? $driver->user->firstname : 'Unknown',
                    'last_name' => $driver->user ? $driver->user->lastname : 'Unknown',
                    'name' => $driver->user ? $driver->user->name : 'Unknown',
                    'debug_user' => $driver->user ? 'User exists' : 'User null',
                ];
            });
        
        return inertia('Admin/Trucks', [
            'trucks' => $trucks,
            'stats' => $stats,
            'availableDrivers' => $availableDrivers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|unique:trucks,plate_number|max:20',
            'vehicle_type' => 'required|string|max:255',
            'capacity' => 'required|numeric|min:0.1|max:100',
            'condition' => 'required|in:excellent,good,fair,poor,needs_maintenance',
            'truck_status' => 'nullable|in:available,in_use,maintenance,inactive',
        ]);

        // Generate unique_id - random numeric string of at least 6 digits
        do {
            $uniqueId = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
        } while (Truck::where('unique_id', $uniqueId)->exists());

        Truck::create([
            'unique_id' => $uniqueId,
            'plate_number' => $validated['plate_number'],
            'vehicle_type' => $validated['vehicle_type'],
            'capacity' => $validated['capacity'],
            'condition' => $validated['condition'],
            'truck_status' => $validated['truck_status'] ?? 'available',
        ]);

        return redirect()->back()->with('success', 'Truck added successfully!');
    }

    public function update(Request $request, Truck $truck)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|unique:trucks,plate_number,' . $truck->truck_id . ',truck_id|max:20',
            'vehicle_type' => 'required|string|max:255',
            'capacity' => 'required|numeric|min:0.1|max:100',
            'condition' => 'required|in:excellent,good,fair,poor,needs_maintenance',
            'truck_status' => 'required|in:available,in_use,maintenance,inactive',
        ]);

        $truck->update($validated);

        return redirect()->back()->with('success', 'Truck updated successfully!');
    }

    public function destroy(Truck $truck)
    {
        $truck->delete();
        return redirect()->back()->with('success', 'Truck deleted successfully!');
    }

    public function toggleStatus(Truck $truck)
    {
        if ($truck->truck_status === 'in_use') {
            return redirect()->back()->with('error', 'Cannot change status of a truck that is currently in use.');
        }

        $newStatus = $truck->truck_status === 'available' ? 'inactive' : 'available';
        $truck->update(['truck_status' => $newStatus]);
        
        return redirect()->back()->with('success', 'Truck status updated successfully!');
    }

    public function assignDriver(Request $request, Truck $truck)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,driver_id',
        ]);

        $driver = Driver::find($validated['driver_id']);
        
        // Check if driver already has a truck
        if ($driver->truck_id !== null) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver already assigned to a truck!'
                ], 400);
            }
            return redirect()->back()->with('error', 'Driver already assigned to a truck!');
        }

        // Assign driver to truck
        $driver->update(['truck_id' => $truck->truck_id]);

        // Update truck status to in_use
        $truck->update(['truck_status' => 'in_use']);

        // Prepare truck information for driver app
        $truckInfo = [
            'truck_id' => $truck->truck_id,
            'plate_number' => $truck->plate_number,
            'vehicle_type' => $truck->vehicle_type,
            'capacity' => $truck->capacity,
            'condition' => $truck->condition,
            'truck_status' => $truck->truck_status,
            'last_maintenance_date' => $truck->last_maintenance_date,
            'next_inspection' => $truck->next_inspection,
            'insurance_status' => $truck->insurance_status,
        ];

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Driver assigned to truck successfully!',
                'driver_id' => $driver->driver_id,
                'truck' => $truckInfo
            ]);
        }

        return redirect()->back()->with('success', 'Driver assigned to truck successfully!');
    }
}
