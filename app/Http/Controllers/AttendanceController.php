<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        // Default to today if no date is provided or if date is empty string
        $date = $request->input('date') ?: now()->format('Y-m-d');
        
        $query = \App\Models\User::where('role', 'mechanic')
            ->with(['attendances' => function($q) use ($date) {
                $q->whereDate('attendance_date', $date)->with('logs');
            }]);

        if ($request->has('search') && $request->search) {
            $searchTerms = array_filter(explode(' ', $request->search));
            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->where(function ($q2) use ($term) {
                        $q2->where('firstname', 'like', "%{$term}%")
                          ->orWhere('lastname', 'like', "%{$term}%")
                          ->orWhere('middle_name', 'like', "%{$term}%")
                          ->orWhere('username', 'like', "%{$term}%")
                          ->orWhere('email', 'like', "%{$term}%");
                    });
                }
            });
        }

        if ($request->has('status') && $request->status) {
            $status = $request->status;
            $query->where(function($q) use ($status, $date) {
                if ($status === 'Absent') {
                    $q->whereDoesntHave('attendances', function($sq) use ($date) {
                        $sq->whereDate('attendance_date', $date);
                    })->orWhereHas('attendances', function($sq) use ($date, $status) {
                        $sq->whereDate('attendance_date', $date)->where('status', 'Absent');
                    });
                } else {
                    $q->whereHas('attendances', function($sq) use ($date, $status) {
                        $sq->whereDate('attendance_date', $date)->where('status', $status);
                    });
                }
            });
        }

        // Order users by name for better readability
        $users = $query->orderBy('firstname')->orderBy('lastname')->paginate(10)->withQueryString();

        // Transform the collection to match what the frontend expects
        $users->getCollection()->transform(function ($user) use ($date) {
            $attendance = $user->attendances->first();
            
            if ($attendance) {
                // Ensure user relation is attached for the frontend
                $attendance->setRelation('user', $user);
                return $attendance;
            }

            // Return mock absent record if no attendance exists
            return (object) [
                'id' => 'absent_' . $user->user_id,
                'user_id' => $user->user_id,
                'attendance_date' => $date,
                'morning_in' => null,
                'morning_out' => null,
                'afternoon_in' => null,
                'afternoon_out' => null,
                'total_work_hours' => 0,
                'late_minutes' => 0,
                'undertime_minutes' => 0,
                'status' => 'Absent',
                'user' => $user,
                'logs' => []
            ];
        });

        return inertia('OfficeStaff/Attendance', [
            'attendances' => $users,
            'filters' => [
                'date' => $date,
                'status' => $request->status,
                'search' => $request->search
            ]
        ]);
    }
}
