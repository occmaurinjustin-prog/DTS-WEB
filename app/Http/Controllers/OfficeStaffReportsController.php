<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\MaintenanceReport;
use App\Models\PartRequest;
use App\Models\Payroll;
use App\Models\RescueRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OfficeStaffReportsController extends Controller
{
    public function index(Request $request)
    {
        $dateRange = $request->input('dateRange', 'month');
        $dateFilter = $this->getDateRange($dateRange);

        // ── Attendance Report Data ──
        $attendanceData = Attendance::with('user:user_id,firstname,lastname,username')
            ->whereBetween('attendance_date', [$dateFilter['start'], $dateFilter['end']])
            ->orderBy('attendance_date', 'desc')
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'mechanic_name' => $a->user ? ($a->user->firstname . ' ' . $a->user->lastname) : 'Unknown',
                    'username' => $a->user->username ?? 'N/A',
                    'date' => $a->attendance_date->format('Y-m-d'),
                    'morning_in' => $a->morning_in,
                    'morning_out' => $a->morning_out,
                    'afternoon_in' => $a->afternoon_in,
                    'afternoon_out' => $a->afternoon_out,
                    'total_hours' => $a->total_work_hours ?? 0,
                    'late_minutes' => $a->late_minutes ?? 0,
                    'status' => $a->status ?? 'present',
                ];
            });

        $attendanceStats = [
            'total_records' => $attendanceData->count(),
            'total_hours' => $attendanceData->sum('total_hours'),
            'avg_hours' => $attendanceData->count() > 0 ? round($attendanceData->avg('total_hours'), 1) : 0,
            'total_late' => $attendanceData->where('late_minutes', '>', 0)->count(),
            'absent_count' => $attendanceData->where('status', 'absent')->count(),
        ];

        // ── Maintenance Report Data ──
        $maintenanceData = MaintenanceReport::with(['driver.user', 'mechanic', 'truck'])
            ->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'type' => $r->driver_id ? 'driver_report' : 'inspection',
                    'reporter' => $r->driver_id
                        ? ($r->driver && $r->driver->user ? $r->driver->user->firstname . ' ' . $r->driver->user->lastname : 'Driver')
                        : ($r->mechanic ? $r->mechanic->firstname . ' ' . $r->mechanic->lastname : 'Mechanic'),
                    'truck' => $r->truck ? $r->truck->plate_number : 'N/A',
                    'issue_title' => $r->issue_title ?: 'Inspection',
                    'priority' => $r->priority_level ?? 'N/A',
                    'status' => $r->status,
                    'overall_condition' => $r->overall_condition ?? 'N/A',
                    'date_submitted' => $r->created_at->format('Y-m-d'),
                    'date_resolved' => $r->completed_at ? $r->completed_at->format('Y-m-d') : null,
                ];
            });

        $maintenanceStats = [
            'total' => $maintenanceData->count(),
            'driver_reports' => $maintenanceData->where('type', 'driver_report')->count(),
            'inspections' => $maintenanceData->where('type', 'inspection')->count(),
            'pending' => $maintenanceData->where('status', 'pending')->count(),
            'completed' => $maintenanceData->where('status', 'completed')->count(),
        ];

        // ── Inventory Report Data ──
        $inventoryData = Inventory::orderBy('part_name')->get()->map(function ($p) {
            return [
                'id' => $p->Inventory_id,
                'part_name' => $p->part_name,
                'category' => $p->category ?? 'Uncategorized',
                'quantity' => $p->quantity,
                'min_stock_level' => $p->min_stock_level,
                'status' => $p->part_status,
            ];
        });

        // Get stock movement for the period
        $stockIn = InventoryTransaction::where('type', 'stock_in')
            ->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']])
            ->sum('quantity');
        $stockOut = InventoryTransaction::where('type', 'stock_out')
            ->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']])
            ->sum('quantity');

        $inventoryStats = [
            'total_parts' => $inventoryData->count(),
            'low_stock' => $inventoryData->where('status', 'low_stock')->count(),
            'out_of_stock' => $inventoryData->where('status', 'out_of_stock')->count(),
            'stock_in' => $stockIn,
            'stock_out' => $stockOut,
        ];

        // ── Part Requests Report Data ──
        $partRequestsData = PartRequest::with(['mechanic:user_id,firstname,lastname,username'])
            ->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pr) {
                return [
                    'id' => $pr->id,
                    'mechanic_name' => $pr->mechanic ? ($pr->mechanic->firstname . ' ' . $pr->mechanic->lastname) : 'Unknown',
                    'part_name' => $pr->part_name,
                    'quantity' => $pr->quantity,
                    'reason' => $pr->reason,
                    'status' => $pr->status,
                    'date_requested' => $pr->created_at->format('Y-m-d'),
                ];
            });

        $partRequestsStats = [
            'total' => $partRequestsData->count(),
            'pending' => $partRequestsData->where('status', 'pending')->count(),
            'approved' => $partRequestsData->where('status', 'approved')->count(),
            'completed' => $partRequestsData->where('status', 'completed')->count(),
            'rejected' => $partRequestsData->where('status', 'rejected')->count(),
        ];

        // ── Payroll Report Data ──
        $payrollData = Payroll::with(['user:user_id,firstname,lastname,username', 'details'])
            ->whereBetween('period_start', [$dateFilter['start'], $dateFilter['end']])
            ->orWhereBetween('period_end', [$dateFilter['start'], $dateFilter['end']])
            ->orderBy('period_start', 'desc')
            ->get()
            ->map(function ($p) {
                $totalHours = $p->details->sum('total_hours');
                return [
                    'id' => $p->payroll_id,
                    'mechanic_name' => $p->user ? ($p->user->firstname . ' ' . $p->user->lastname) : 'Unknown',
                    'username' => $p->user->username ?? 'N/A',
                    'period_start' => $p->period_start->format('Y-m-d'),
                    'period_end' => $p->period_end->format('Y-m-d'),
                    'total_hours' => round($totalHours, 2),
                    'gross_pay' => $p->gross_salary,
                    'net_pay' => $p->net_salary,
                    'status' => $p->status ?? 'generated',
                ];
            });

        $payrollStats = [
            'total_records' => $payrollData->count(),
            'total_gross' => $payrollData->sum('gross_pay'),
            'total_net' => $payrollData->sum('net_pay'),
            'avg_hours' => $payrollData->count() > 0 ? round($payrollData->avg('total_hours'), 1) : 0,
        ];

        // ── Rescue Report Data ──
        $rescueData = RescueRequest::with(['driver.user', 'mechanic', 'truck'])
            ->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->rescue_id,
                    'date' => $r->created_at->format('Y-m-d H:i'),
                    'driver_name' => $r->driver && $r->driver->user
                        ? ($r->driver->user->firstname . ' ' . $r->driver->user->lastname) 
                        : 'Unknown',
                    'truck' => $r->truck ? $r->truck->plate_number : 'N/A',
                    'issue_category' => $r->issue_category,
                    'address' => $r->address ?? 'GPS Location',
                    'mechanic_name' => $r->mechanic
                        ? ($r->mechanic->firstname . ' ' . $r->mechanic->lastname) 
                        : 'Unassigned',
                    'status' => $r->status,
                    'resolved_at' => $r->resolved_at ? $r->resolved_at->format('Y-m-d H:i') : null,
                ];
            });

        $rescueStats = [
            'total' => $rescueData->count(),
            'resolved' => $rescueData->where('status', 'resolved')->count(),
            'pending' => $rescueData->where('status', 'pending')->count(),
        ];

        // ── Truck Report Data ──
        $truckData = \App\Models\Truck::withCount([
            'driverReports as total_maintenance' => function($query) use ($dateFilter) {
                $query->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']]);
            }
        ])->get()->map(function($truck) use ($dateFilter) {
            $rescues = \App\Models\RescueRequest::where('truck_id', $truck->truck_id)
                ->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']])
                ->count();
                
            return [
                'truck_id' => $truck->truck_id,
                'unique_id' => $truck->unique_id,
                'plate_number' => $truck->plate_number,
                'vehicle_type' => $truck->vehicle_type,
                'truck_status' => $truck->truck_status,
                'total_maintenance' => $truck->total_maintenance,
                'total_rescues' => $rescues,
            ];
        });

        $truckStats = [
            'total_trucks' => $truckData->count(),
            'active_trucks' => $truckData->whereIn('truck_status', ['available', 'in_use'])->count(),
            'maintenance_needed' => $truckData->where('truck_status', 'maintenance')->count(),
            'total_maintenance_records' => $truckData->sum('total_maintenance'),
            'total_rescue_records' => $truckData->sum('total_rescues'),
        ];

        return Inertia::render('OfficeStaff/Reports', [
            'authUser' => Auth::user(),
            'dateRange' => $dateRange,
            'attendanceData' => $attendanceData->values(),
            'attendanceStats' => $attendanceStats,
            'maintenanceData' => $maintenanceData->values(),
            'maintenanceStats' => $maintenanceStats,
            'inventoryData' => $inventoryData->values(),
            'inventoryStats' => $inventoryStats,
            'partRequestsData' => $partRequestsData->values(),
            'partRequestsStats' => $partRequestsStats,
            'payrollData' => $payrollData->values(),
            'payrollStats' => $payrollStats,
            'rescueData' => $rescueData->values(),
            'rescueStats' => $rescueStats,
            'truckData' => $truckData->values(),
            'truckStats' => $truckStats,
        ]);
    }

    private function getDateRange($range)
    {
        $now = now();
        switch ($range) {
            case 'today':
                return ['start' => $now->copy()->startOfDay(), 'end' => $now->copy()->endOfDay()];
            case 'week':
                return ['start' => $now->copy()->startOfWeek(), 'end' => $now->copy()->endOfWeek()];
            case 'year':
                return ['start' => $now->copy()->startOfYear(), 'end' => $now->copy()->endOfYear()];
            case 'month':
            default:
                return ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()];
        }
    }
}
