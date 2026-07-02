<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;

class AttendanceService
{
    /**
     * Process Time In / Time Out for a user.
     */
    public function logAttendance(User $user): Attendance
    {
        $today = Carbon::today();
        $now = Carbon::now();

        // Find existing attendance for today
        $attendance = Attendance::where('user_id', $user->user_id)
            ->whereDate('attendance_date', $today)
            ->first();

        if (!$attendance) {
            // Log Time In
            return Attendance::create([
                'user_id' => $user->user_id,
                'attendance_date' => $today,
                'time_in' => $now,
                'attendance_status' => 'in',
            ]);
        } else {
            // Log Time Out and calculate hours
            $timeIn = Carbon::parse($attendance->time_in);
            $workingMinutes = $now->diffInMinutes($timeIn);
            $workingHours = round($workingMinutes / 60, 2);

            // Simple late and overtime logic (Assuming 9 AM to 6 PM schedule for demonstration)
            $expectedTimeIn = Carbon::today()->setTime(9, 0);
            $expectedTimeOut = Carbon::today()->setTime(18, 0);

            $lateMinutes = 0;
            if ($timeIn->greaterThan($expectedTimeIn)) {
                $lateMinutes = $timeIn->diffInMinutes($expectedTimeIn);
            }



            $attendance->update([
                'time_out' => $now,
                'working_hours' => $workingHours,
                'late_minutes' => $lateMinutes,
                'attendance_status' => 'completed',
            ]);

            return $attendance;
        }
    }
}
