<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RescueRequest;
use App\Models\RescueMedia;
use App\Models\Driver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RescueApiController extends Controller
{
    // For Driver: Submit a new rescue request
    public function submit(Request $request)
    {
        try {
            $user = Auth::user();
            $driver = Driver::where('user_id', $user->user_id)->first();
            
            if (!$driver) {
                return response()->json(['message' => 'Driver not found'], 404);
            }

            $validated = $request->validate([
                'issue_category' => 'required|string',
                'description' => 'nullable|string',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'address' => 'nullable|string',
            ]);

            $rescueRequest = RescueRequest::create([
                'driver_id' => $driver->driver_id,
                'truck_id' => $driver->truck_id,
                'issue_category' => $validated['issue_category'],
                'description' => $validated['description'] ?? null,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'address' => $validated['address'] ?? null,
                'status' => 'pending',
            ]);

            // Handle media upload
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $path = $file->store('rescue_media', 'public');
                    $fileType = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image';
                    
                    RescueMedia::create([
                        'rescue_id' => $rescueRequest->rescue_id,
                        'file_path' => $path,
                        'file_type' => $fileType,
                    ]);
                }
            }

            event(new \App\Events\RescueRequestSubmitted(
                $rescueRequest->rescue_id,
                $user->firstname . ' ' . $user->lastname,
                $rescueRequest->issue_category
            ));

            return response()->json([
                'message' => 'Rescue request submitted successfully',
                'data' => $rescueRequest->load('media')
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Error submitting rescue request: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    // For Driver: Get active rescue request
    public function driverActiveRescue(Request $request)
    {
        $user = Auth::user();
        $driver = Driver::where('user_id', $user->user_id)->first();

        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $activeRescue = RescueRequest::where('driver_id', $driver->driver_id)
            ->whereIn('status', ['pending', 'assigned', 'en_route', 'arrived'])
            ->with(['mechanic', 'media'])
            ->latest()
            ->first();

        return response()->json([
            'data' => $activeRescue
        ]);
    }

    // For Mechanic: Get assigned rescues
    public function mechanicAssignments(Request $request)
    {
        $user = Auth::user();
        
        $assignments = RescueRequest::where('mechanic_id', $user->user_id)
            ->whereIn('status', ['assigned', 'en_route', 'arrived', 'resolved'])
            ->with(['driver.user', 'truck', 'media'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $assignments
        ]);
    }

    // For Driver: Get rescue history
    public function driverHistory(Request $request)
    {
        $user = Auth::user();
        $driver = Driver::where('user_id', $user->user_id)->first();

        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $history = RescueRequest::where('driver_id', $driver->driver_id)
            ->where('status', 'resolved')
            ->with(['mechanic', 'media', 'usedParts'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $history
        ]);
    }

    // For Mechanic: Update status (Acknowledge, Arrived, Resolved)
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'status' => 'required|in:en_route,arrived,resolved',
            'notes' => 'nullable|string',
            'parts' => 'nullable|array',
            'parts.*.Inventory_id' => 'required|exists:inventory,Inventory_id',
            'parts.*.quantity' => 'required|integer|min:1',
        ]);

        $rescue = RescueRequest::where('rescue_id', $id)
            ->where('mechanic_id', $user->user_id)
            ->firstOrFail();

        $rescue->status = $validated['status'];
        
        if (isset($validated['notes'])) {
            $rescue->notes = $validated['notes'];
        }

        if ($validated['status'] === 'resolved') {
            $rescue->resolved_at = now();
            
            // Handle parts deduction if provided
            if (isset($validated['parts']) && count($validated['parts']) > 0) {
                foreach ($validated['parts'] as $partData) {
                    $inventory = \App\Models\Inventory::findOrFail($partData['Inventory_id']);
                    
                    if ($inventory->quantity < $partData['quantity']) {
                        return response()->json([
                            'message' => "Not enough stock for {$inventory->part_name}. Available: {$inventory->quantity}"
                        ], 400);
                    }

                    // Deduct inventory
                    $inventory->quantity -= $partData['quantity'];
                    $inventory->save();

                    // Check if already attached (in case of retry or existing parts)
                    $existing = $rescue->parts()->where('inventory.Inventory_id', $partData['Inventory_id'])->first();
                    
                    if ($existing) {
                        $newQuantity = $existing->pivot->quantity + $partData['quantity'];
                        $rescue->parts()->updateExistingPivot($partData['Inventory_id'], ['quantity' => $newQuantity]);
                    } else {
                        $rescue->parts()->attach($partData['Inventory_id'], ['quantity' => $partData['quantity']]);
                    }
                }
            }
        }

        $rescue->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'data' => $rescue
        ]);
    }

    // For Mechanic: Pinging real-time location while en_route
    public function updateMechanicLocation(Request $request, $id)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $rescue = RescueRequest::where('rescue_id', $id)
            ->where('mechanic_id', $user->user_id)
            ->whereIn('status', ['assigned', 'en_route'])
            ->firstOrFail();

        $rescue->mechanic_latitude = $validated['latitude'];
        $rescue->mechanic_longitude = $validated['longitude'];
        $rescue->save();

        return response()->json([
            'message' => 'Location updated'
        ]);
    }
}
