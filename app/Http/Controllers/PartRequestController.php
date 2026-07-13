<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PartRequestController extends Controller
{
    public function officeStaffIndex()
    {
        $requests = \App\Models\PartRequest::with(['mechanic', 'inventory'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('OfficeStaff/PartRequests', [
            'partRequests' => $requests,
            'authUser' => \Illuminate\Support\Facades\Auth::user()
        ]);
    }

    public function updateOfficeStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,completed',
        ]);

        $partRequest = \App\Models\PartRequest::findOrFail($id);
        
        // Automatic Stock-In Logic
        if ($validated['status'] === 'completed' && $partRequest->status !== 'completed') {
            $inventory = null;
            if ($partRequest->inventory_id) {
                $inventory = \App\Models\Inventory::find($partRequest->inventory_id);
            } else {
                // Try to find by name
                $inventory = \App\Models\Inventory::where('part_name', $partRequest->part_name)->first();
            }

            if (!$inventory) {
                // Create new inventory item
                $inventory = \App\Models\Inventory::create([
                    'part_name' => $partRequest->part_name,
                    'quantity' => 0,
                    'min_stock_level' => 5,
                    'part_status' => 'available_stock',
                    'price' => 0
                ]);
                $partRequest->inventory_id = $inventory->Inventory_id;
            }

            // Add quantity
            $inventory->quantity += $partRequest->quantity;
            $inventory->save();

            // Log Transaction
            \App\Models\InventoryTransaction::create([
                'inventory_id' => $inventory->Inventory_id,
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'type' => 'stock_in',
                'quantity' => $partRequest->quantity,
                'reference_type' => 'part_request',
                'reference_id' => $partRequest->id,
                'remarks' => 'Automatic stock-in from completed part request.',
            ]);
        }

        $partRequest->status = $validated['status'];
        if (in_array($validated['status'], ['approved', 'rejected'])) {
            $partRequest->approved_by = \Illuminate\Support\Facades\Auth::id();
        }
        $partRequest->save();

        return redirect()->back()->with('success', 'Part request status updated successfully.');
    }

    public function updatePurchaserStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:purchased,completed',
        ]);

        $partRequest = \App\Models\PartRequest::findOrFail($id);
        
        if ($validated['status'] === 'completed' && $partRequest->status !== 'completed') {
            // Optional: Automatically stock in if marked completed. The user said "depends on what to do in real life". 
            // We will just update status for now, and office staff can stock in manually if they want, or we can just automate it if inventory_id exists.
            // Let's just update the status as per typical workflow.
        }

        $partRequest->status = $validated['status'];
        $partRequest->save();

        return redirect()->back()->with('success', 'Part request status updated successfully.');
    }
}
