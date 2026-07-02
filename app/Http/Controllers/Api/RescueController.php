<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RescueRequest;
use App\Models\RescueRequestMedia;
use App\Models\Driver;
use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class RescueController extends Controller
{
    /**
     * Driver submits a breakdown report
     */
    public function submitRequest(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'driver') {
                return response()->json(['success' => false, 'message' => 'Unauthorized. Must be a driver.'], 403);
            }

            $driver = Driver::where('user_id', $user->user_id)->first();
            if (!$driver) {
                return response()->json(['success' => false, 'message' => 'Driver record not found.'], 404);
            }

            $request->validate([
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'address' => 'required|string',
                'categories' => 'required|array',
                'description' => 'required|string',
                'severity' => 'required|string|in:low,medium,high,critical',
                'is_drivable' => 'required|boolean',
            ]);

            // Find current active delivery to link waybill
            $activeDelivery = Delivery::where('driver_id', $driver->driver_id)
                ->whereIn('delivery_status', ['assigned', 'in_transit', 'Assigned', 'In Transit'])
                ->first();

            $rescueRequest = RescueRequest::create([
                'driver_id' => $driver->driver_id,
                'truck_id' => $driver->truck_id ?? 1, // Fallback to 1 if no truck assigned
                'delivery_id' => $activeDelivery?->delivery_id,
                'waybill' => $activeDelivery?->waybill,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'address' => $request->address,
                'categories' => $request->categories,
                'description' => $request->description,
                'severity' => $request->severity,
                'is_drivable' => $request->is_drivable,
                'status' => 'pending'
            ]);

            // Handle file attachments (media)
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $mime = $file->getMimeType();
                    $mediaType = str_contains($mime, 'video') ? 'video' : 'photo';
                    
                    $path = $file->store('rescue_media', 'public');
                    
                    RescueRequestMedia::create([
                        'rescue_request_id' => $rescueRequest->id,
                        'file_path' => '/storage/' . $path,
                        'media_type' => $mediaType,
                        'type' => 'before'
                    ]);
                }
            }

            // Update driver availability status to reflect breakdown
            $driver->update(['availability_status' => 'busy']);

            return response()->json([
                'success' => true,
                'message' => 'Rescue assistance request submitted successfully.',
                'rescue_request' => $rescueRequest->load('media')
            ]);
        } catch (\Exception $e) {
            Log::error('Error submitting rescue request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current active rescue request for the driver
     */
    public function getDriverActiveRescue()
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'driver') {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }

            $driver = Driver::where('user_id', $user->user_id)->first();
            if (!$driver) {
                return response()->json(['success' => false, 'message' => 'Driver record not found.'], 404);
            }

            $rescueRequest = RescueRequest::where('driver_id', $driver->driver_id)
                ->whereNotIn('status', ['closed'])
                ->with(['mechanic', 'media', 'truck'])
                ->first();

            if (!$rescueRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active rescue request found.'
                ]);
            }

            return response()->json([
                'success' => true,
                'rescue_request' => $rescueRequest
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching active rescue request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch request details.'
            ], 500);
        }
    }

    /**
     * Driver confirms repair completion and closes request
     */
    public function confirmClose(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'driver') {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }

            $request->validate(['rescue_request_id' => 'required|exists:rescue_requests,id']);

            $rescueRequest = RescueRequest::findOrFail($request->rescue_request_id);
            $rescueRequest->update([
                'status' => 'closed',
                'closed_at' => now()
            ]);

            // Release driver back to available
            $driver = Driver::where('user_id', $user->user_id)->first();
            if ($driver) {
                $driver->update(['availability_status' => 'available']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Rescue assistance case closed and marked as completed.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error closing rescue request: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to close request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mechanic retrieves assigned active rescue job
     */
    public function getMechanicAssignments()
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mechanic') {
                return response()->json(['success' => false, 'message' => 'Unauthorized. Must be a mechanic.'], 403);
            }

            $rescueRequest = RescueRequest::where('mechanic_id', $user->user_id)
                ->whereNotIn('status', ['closed'])
                ->with(['driver.user', 'truck', 'media'])
                ->first();

            if (!$rescueRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active rescue job assigned.'
                ]);
            }

            return response()->json([
                'success' => true,
                'rescue_request' => $rescueRequest
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching mechanic assignments: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assignments.'
            ], 500);
        }
    }

    /**
     * Mechanic accepts or rejects the assignment
     */
    public function respondToAssignment(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mechanic') {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }

            $request->validate([
                'rescue_request_id' => 'required|exists:rescue_requests,id',
                'response' => 'required|in:accept,reject'
            ]);

            $rescueRequest = RescueRequest::findOrFail($request->rescue_request_id);

            if ($request->response === 'accept') {
                $rescueRequest->update(['status' => 'accepted']);
            } else {
                // Reject assignment - clear the mechanic_id and revert to pending
                $rescueRequest->update([
                    'mechanic_id' => null,
                    'status' => 'pending',
                    'eta_minutes' => null
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Response recorded successfully.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error responding to rescue assignment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record response.'
            ], 500);
        }
    }

    /**
     * Mechanic updates the status of the repair/assistance request
     */
    public function updateStatus(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mechanic') {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }

            $request->validate([
                'rescue_request_id' => 'required|exists:rescue_requests,id',
                'status' => 'required|in:accepted,on_the_way,arrived,inspection_started,repair_in_progress,waiting_for_parts,repair_completed,cannot_repair',
                'inspection_findings' => 'nullable|string',
                'repair_notes' => 'nullable|string',
            ]);

            $rescueRequest = RescueRequest::findOrFail($request->rescue_request_id);

            $updateData = ['status' => $request->status];
            if ($request->has('inspection_findings')) {
                $updateData['inspection_findings'] = $request->inspection_findings;
            }
            if ($request->has('repair_notes')) {
                $updateData['repair_notes'] = $request->repair_notes;
            }

            $rescueRequest->update($updateData);

            // Handle uploading after-repair photos if completed or cannot repair
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $path = $file->store('rescue_media', 'public');
                    
                    RescueRequestMedia::create([
                        'rescue_request_id' => $rescueRequest->id,
                        'file_path' => '/storage/' . $path,
                        'media_type' => 'photo',
                        'type' => 'after'
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully.',
                'rescue_request' => $rescueRequest->load('media')
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating rescue request status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status.'
            ], 500);
        }
    }

    /**
     * Mechanic updates their current GPS coordinates
     */
    public function updateMechanicLocation(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mechanic') {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }

            $request->validate([
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
            ]);

            $user->update([
                'current_latitude' => $request->latitude,
                'current_longitude' => $request->longitude,
                'last_location_update' => now()
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error updating mechanic location: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
