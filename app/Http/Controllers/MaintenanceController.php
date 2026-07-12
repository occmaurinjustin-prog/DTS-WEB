<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\MaintenanceReport;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    // Fleet Management Dashboard
    public function index()
    {
        $driverReports = MaintenanceReport::whereNull('mechanic_id')
            ->with(['driver.user', 'truck'])
            ->latest()
            ->take(10)
            ->get();

        $stats = [
            'total_reports' => MaintenanceReport::count(),
            'pending_reports' => MaintenanceReport::whereNull('mechanic_id')->where('status', 'pending')->count(),
            'approved_reports' => MaintenanceReport::whereNull('mechanic_id')->where('status', 'approved')->count(),
            'rejected_reports' => MaintenanceReport::whereNull('mechanic_id')->where('status', 'rejected')->count(),
        ];

        $mechanics = \App\Models\User::where('role', 'mechanic')->get();

        return Inertia::render('OfficeStaff/Maintenance', [
            'reports' => $driverReports,
            'stats' => $stats,
            'authUser' => Auth::user(),
            'mechanics' => $mechanics,
        ]);
    }

    // Get driver maintenance reports
    public function getDriverReports(Request $request)
    {
        $query = MaintenanceReport::whereNull('mechanic_id')
            ->with(['driver.user', 'truck', 'maintenance']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority_level', $request->priority);
        }

        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->has('truck_id')) {
            $query->where('truck_id', $request->truck_id);
        }

        $reports = $query->with(['maintenance'])->orderBy('created_at', 'desc')->get();

        return response()->json(['reports' => $reports]);
    }

    // Update driver report status
    public function updateDriverReportStatus(Request $request, $id)
    {
        $report = MaintenanceReport::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,in_review,approved,in_progress,completed,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $report->update($validated);

        return redirect()->back()->with('success', 'Driver report status updated successfully');
    }

    // Get inventory parts for maintenance workflow
    public function getInventory()
    {
        $parts = Inventory::orderBy('part_name')->get();
        
        return response()->json(['parts' => $parts]);
    }

    // Store new part
    public function storePart(Request $request)
    {
        $validated = $request->validate([
            'part_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'part_status' => 'required|in:available,low_stock,out_of_stock',
        ]);

        $part = Inventory::create($validated);
        $part->updateStatus();

        InventoryTransaction::create([
            'inventory_id' => $part->Inventory_id,
            'user_id' => Auth::id(),
            'type' => 'stock_in',
            'quantity' => $validated['quantity'],
            'reference_type' => 'manual',
            'remarks' => 'Initial stock addition',
        ]);

        return redirect()->back()->with('success', 'Part added successfully!');
    }

    // Update existing part
    public function updatePart(Request $request, $id)
    {
        $part = Inventory::findOrFail($id);

        $validated = $request->validate([
            'part_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'part_status' => 'required|in:available,low_stock,out_of_stock',
        ]);

        $oldQuantity = $part->quantity;

        $part->update($validated);
        $part->updateStatus();

        if ($validated['quantity'] != $oldQuantity) {
            $diff = $validated['quantity'] - $oldQuantity;
            InventoryTransaction::create([
                'inventory_id' => $part->Inventory_id,
                'user_id' => Auth::id(),
                'type' => $diff > 0 ? 'stock_in' : 'stock_out',
                'quantity' => abs($diff),
                'reference_type' => 'manual',
                'remarks' => 'Manual stock adjustment',
            ]);
        }

        return redirect()->back()->with('success', 'Part updated successfully!');
    }

    // Get transactions for a part
    public function getTransactions($id)
    {
        $transactions = InventoryTransaction::where('inventory_id', $id)
            ->with('user:user_id,firstname,lastname')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['transactions' => $transactions]);
    }

    // Get all transactions for the master ledger
    public function getAllTransactions()
    {
        $transactions = InventoryTransaction::with(['user:user_id,firstname,lastname', 'inventory'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['transactions' => $transactions]);
    }

    // Delete part
    public function deletePart($id)
    {
        $part = Inventory::findOrFail($id);
        $part->delete();

        return response()->json(['success' => true]);
    }

    // Process maintenance workflow - create maintenance record and deduct inventory
    public function processWorkflow(Request $request)
    {
        \Log::info('processWorkflow called', $request->all());
        
        try {
            $validated = $request->validate([
                'report_id' => 'required|exists:maintenance_reports,id',
                'schedule.repair_date' => 'required|date',
                'schedule.repair_time' => 'required',
                'schedule.repair_location' => 'required|string|max:255',
                'schedule.assign_mechanics' => 'nullable|exists:users,user_id',
            ]);
            
            \Log::info('Validation passed', $validated);

            DB::beginTransaction();

            // Create maintenance record using direct DB insert to ensure it works
            try {
                $maintenanceId = DB::table('maintenances')->insertGetId([
                    'maintenance_report_id' => $validated['report_id'],
                    'repair_date' => $validated['schedule']['repair_date'],
                    'repair_time' => $validated['schedule']['repair_time'],
                    'repair_location' => $validated['schedule']['repair_location'],
                    'assign_mechanics' => $validated['schedule']['assign_mechanics'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                \Log::info('Maintenance created via DB insert', ['maintenance_id' => $maintenanceId]);
            } catch (\Exception $createError) {
                \Log::error('Failed to create maintenance', ['error' => $createError->getMessage(), 'trace' => $createError->getTraceAsString()]);
                throw new \Exception('Database error: ' . $createError->getMessage());
            }


            // Note: Status remains 'approved' - Start button will change it to 'in_progress'
            $report = MaintenanceReport::findOrFail($validated['report_id']);

            DB::commit();
            
            \Log::info('Workflow completed successfully');

            return redirect()->route('office_staff.maintenance')->with('success', 'Maintenance workflow processed successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', ['errors' => $e->errors()]);
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Workflow failed', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['error' => 'Failed to process workflow: ' . $e->getMessage()]);
        }
    }
}
