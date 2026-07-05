<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\RescueRequest;
use App\Models\User;

class RescueDispatchController extends Controller
{
    // Render the Rescue Dispatch Dashboard for Office Staff
    public function index()
    {
        // Get active rescues
        $activeRescues = RescueRequest::with(['driver.user', 'truck', 'mechanic', 'media'])
            ->whereIn('status', ['pending', 'assigned', 'en_route', 'arrived'])
            ->latest()
            ->get();
            
        // Get rescue history (resolved)
        $rescueHistory = RescueRequest::with(['driver.user', 'truck', 'mechanic'])
            ->where('status', 'resolved')
            ->latest()
            ->take(10)
            ->get();

        // Get available mechanics (users with role 'mechanic')
        $mechanics = User::where('role', 'mechanic')
            ->where('is_active', true)
            ->get();

        // Get available inventory parts
        $inventory = \App\Models\Inventory::where('quantity', '>', 0)
            ->where('part_status', '!=', 'archived')
            ->get();

        return Inertia::render('OfficeStaff/RescueDispatch', [
            'activeRescues' => $activeRescues,
            'rescueHistory' => $rescueHistory,
            'mechanics' => $mechanics,
            'inventory' => $inventory,
        ]);
    }

    // Render the Rescue History Page for Office Staff
    public function history()
    {
        $rescueHistory = RescueRequest::with(['driver.user', 'truck', 'mechanic', 'media', 'parts'])
            ->where('status', 'resolved')
            ->latest()
            ->get();

        return Inertia::render('OfficeStaff/RescueHistory', [
            'rescueHistory' => $rescueHistory,
        ]);
    }

    // Assign a mechanic to a rescue request
    public function assign(Request $request, $id)
    {
        $validated = $request->validate([
            'mechanic_id' => 'required|exists:users,user_id',
            'notes' => 'nullable|string',
            'parts' => 'nullable|array',
            'parts.*.Inventory_id' => 'required|exists:inventory,Inventory_id',
            'parts.*.quantity' => 'required|integer|min:1',
        ]);

        $rescue = RescueRequest::findOrFail($id);
        
        $rescue->mechanic_id = $validated['mechanic_id'];
        $rescue->status = 'assigned';
        
        if (isset($validated['notes'])) {
            $rescue->notes = $validated['notes'];
        }

        $rescue->save();

        if (isset($validated['parts']) && count($validated['parts']) > 0) {
            foreach ($validated['parts'] as $partData) {
                $inventory = \App\Models\Inventory::findOrFail($partData['Inventory_id']);
                
                if ($inventory->quantity < $partData['quantity']) {
                    return redirect()->back()->with('error', "Not enough stock for {$inventory->part_name}. Available: {$inventory->quantity}");
                }

                // Deduct inventory
                $inventory->quantity -= $partData['quantity'];
                $inventory->save();

                // Check if already attached
                $existing = $rescue->parts()->where('inventory.Inventory_id', $partData['Inventory_id'])->first();
                
                if ($existing) {
                    // Update pivot quantity
                    $newQuantity = $existing->pivot->quantity + $partData['quantity'];
                    $rescue->parts()->updateExistingPivot($partData['Inventory_id'], ['quantity' => $newQuantity]);
                } else {
                    // Attach new part
                    $rescue->parts()->attach($partData['Inventory_id'], ['quantity' => $partData['quantity']]);
                }
            }
        }

        return redirect()->back()->with('success', 'Mechanic assigned successfully.');
    }

    // Add parts to a rescue request and deduct from inventory
    public function addParts(Request $request, $id)
    {
        $validated = $request->validate([
            'parts' => 'required|array',
            'parts.*.Inventory_id' => 'required|exists:inventory,Inventory_id',
            'parts.*.quantity' => 'required|integer|min:1',
        ]);

        $rescue = RescueRequest::findOrFail($id);

        foreach ($validated['parts'] as $partData) {
            $inventory = \App\Models\Inventory::findOrFail($partData['Inventory_id']);
            
            if ($inventory->quantity < $partData['quantity']) {
                return redirect()->back()->with('error', "Not enough stock for {$inventory->part_name}. Available: {$inventory->quantity}");
            }

            // Deduct inventory
            $inventory->quantity -= $partData['quantity'];
            $inventory->save();

            // Check if already attached
            $existing = $rescue->parts()->where('inventory.Inventory_id', $partData['Inventory_id'])->first();
            
            if ($existing) {
                // Update pivot quantity
                $newQuantity = $existing->pivot->quantity + $partData['quantity'];
                $rescue->parts()->updateExistingPivot($partData['Inventory_id'], ['quantity' => $newQuantity]);
            } else {
                // Attach new part
                $rescue->parts()->attach($partData['Inventory_id'], ['quantity' => $partData['quantity']]);
            }
        }

        return redirect()->back()->with('success', 'Parts successfully logged and inventory deducted.');
    }
}
