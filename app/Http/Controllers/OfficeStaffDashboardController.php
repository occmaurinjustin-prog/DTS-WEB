<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OfficeStaffDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get statistics for office staff dashboard
        $stats = [
            'total_mechanics' => User::where('role', 'mechanic')->count(),
            'pending_maintenance' => \App\Models\MaintenanceReport::where('status', 'pending')->count(),
            'total_trucks' => \App\Models\Truck::count(),
            'available_trucks' => \App\Models\Truck::where('truck_status', 'available')->count(),
        ];

        // 1. Weekly Attendance Trends (Last 7 days)
        $weeklyAttendance = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::today()->subDays($i);
            $weeklyAttendance[] = [
                'name' => $date->format('D'), // Mon, Tue, etc.
                'Present' => \App\Models\Attendance::whereDate('attendance_date', $date)->whereIn('status', ['Present', 'Half Day'])->count(),
                'Late' => \App\Models\Attendance::whereDate('attendance_date', $date)->where('status', 'Late')->count(),
                'Absent' => User::where('role', 'mechanic')->count() - \App\Models\Attendance::whereDate('attendance_date', $date)->whereIn('status', ['Present', 'Half Day', 'Late'])->count(),
            ];
        }

        // 2. Truck Status Distribution
        $truckStatusesRaw = \App\Models\Truck::selectRaw('truck_status, count(*) as count')->groupBy('truck_status')->get();
        $truckStatuses = [];
        $colorMap = [
            'available' => '#10B981',
            'in_use' => '#3B82F6',
            'maintenance' => '#F59E0B',
            'inactive' => '#EF4444',
            'pending' => '#8B5CF6',
        ];
        foreach($truckStatusesRaw as $ts) {
            $truckStatuses[] = [
                'name' => ucfirst(str_replace('_', ' ', $ts->truck_status)),
                'value' => $ts->count,
                'color' => $colorMap[$ts->truck_status] ?? '#64748B'
            ];
        }
        
        $stats['weekly_attendance'] = $weeklyAttendance;
        $stats['truck_statuses'] = $truckStatuses;

        return inertia('OfficeStaff/Dashboard', [
            'authUser' => $user,
            'userInfo' => $user,
            'officeStaff' => $user,
            'stats' => $stats,
        ]);
    }

    public function profile()
    {
        $user = Auth::user();

        return inertia('OfficeStaff/Profile', [
            'authUser' => $user,
            'userInfo' => $user,
            'officeStaff' => $user,
        ]);
    }
}
