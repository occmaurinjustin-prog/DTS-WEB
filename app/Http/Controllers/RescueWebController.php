<?php

namespace App\Http\Controllers;

use App\Models\RescueRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RescueWebController extends Controller
{
    /**
     * Display the Rescue Assistance Dashboard for Office Staff
     */
    public function index(Request $request)
    {
        $query = RescueRequest::with(['driver.user', 'truck', 'mechanic', 'media'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('severity') && $request->severity != 'all') {
            $query->where('severity', $request->severity);
        }
        if ($request->has('mechanic_id') && $request->mechanic_id != 'all') {
            $query->where('mechanic_id', $request->mechanic_id);
        }

        $rescueRequests = $query->get();

        // Get all mechanics (users with role = 'mechanic')
        $mechanics = User::where('role', 'mechanic')
            ->where('is_active', true)
            ->get();

        return Inertia::render('OfficeStaff/RescueDashboard', [
            'rescueRequests' => $rescueRequests,
            'mechanics' => $mechanics,
            'filters' => $request->only(['status', 'severity', 'mechanic_id'])
        ]);
    }

    /**
     * Assign a mechanic to a rescue request
     */
    public function assignMechanic(Request $request, $id)
    {
        $request->validate([
            'mechanic_id' => 'required|exists:users,user_id',
            'eta_minutes' => 'nullable|integer|min:1'
        ]);

        $rescueRequest = RescueRequest::findOrFail($id);
        
        $rescueRequest->update([
            'mechanic_id' => $request->mechanic_id,
            'eta_minutes' => $request->eta_minutes,
            'status' => 'assigned'
        ]);

        return redirect()->back()->with('success', 'Mechanic assigned successfully.');
    }
}
