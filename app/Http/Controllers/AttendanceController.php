<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with(['user', 'logs']);

        if ($request->has('date') && $request->date) {
            $query->whereDate('attendance_date', $request->date);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $attendances = $query->orderBy('attendance_date', 'desc')->paginate(15)->withQueryString();

        return inertia('OfficeStaff/Attendance', [
            'attendances' => $attendances,
            'filters' => $request->only(['date', 'status', 'search'])
        ]);
    }
}
