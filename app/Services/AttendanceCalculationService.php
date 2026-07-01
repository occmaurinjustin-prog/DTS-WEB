<?php

namespace App\Services;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AttendanceCalculationService
{
    /**
     * Determine the correct attendance type based on current time.
     * and existing attendance record.
     */
    public function determineAttendanceType(Attendance $attendance, Carbon $currentTime): string
    {
        $timeStr = $currentTime->format('H:i');

        // Morning in: Any time before 11:50 AM
        if (empty($attendance->morning_in) && $timeStr < '11:50') {
            return 'morning_in';
        }

        // Morning out: Only available after 11:50 AM, until 1:00 PM (13:00)
        if (!empty($attendance->morning_in) && empty($attendance->morning_out) && $timeStr >= '11:50' && $timeStr < '13:00') {
            return 'morning_out';
        }

        // Afternoon in: Available after 12:00 PM, until 3:50 PM (15:50)
        if (empty($attendance->afternoon_in) && $timeStr >= '12:00' && $timeStr < '15:50') {
            // If they haven't punched out for the morning yet, prioritize that if within valid range
            if (!empty($attendance->morning_in) && empty($attendance->morning_out) && $timeStr < '13:00') {
                return 'morning_out';
            }
            return 'afternoon_in';
        }

        // Afternoon out: Only available after 3:50 PM (15:50)
        if (!empty($attendance->afternoon_in) && empty($attendance->afternoon_out) && $timeStr >= '15:50') {
            return 'afternoon_out';
        }

        return 'unknown';
    }

    /**
     * Recalculate late, undertime, overtime, and total hours for an attendance record.
     */
    public function recalculate(Attendance $attendance): void
    {
        $lateMinutes = 0;
        $undertimeMinutes = 0;
        $overtimeMinutes = 0;
        $totalMinutesWorked = 0;
        
        $date = $attendance->attendance_date->format('Y-m-d');

        // Target times
        $morningTargetIn = Carbon::parse("$date 07:00:00");
        $morningTargetOut = Carbon::parse("$date 12:00:00");
        $afternoonTargetIn = Carbon::parse("$date 13:00:00");
        $afternoonTargetOut = Carbon::parse("$date 16:00:00");

        $morningIn = $attendance->morning_in ? Carbon::parse("$date {$attendance->morning_in}") : null;
        $morningOut = $attendance->morning_out ? Carbon::parse("$date {$attendance->morning_out}") : null;
        $afternoonIn = $attendance->afternoon_in ? Carbon::parse("$date {$attendance->afternoon_in}") : null;
        $afternoonOut = $attendance->afternoon_out ? Carbon::parse("$date {$attendance->afternoon_out}") : null;

        // Morning Shift Computation
        if ($morningIn) {
            // Late
            if ($morningIn->greaterThan($morningTargetIn)) {
                $lateMinutes += abs($morningIn->diffInMinutes($morningTargetIn));
            }
        }
        
        if ($morningIn && $morningOut) {
            // Undertime
            if ($morningOut->lessThan($morningTargetOut)) {
                $undertimeMinutes += abs($morningOut->diffInMinutes($morningTargetOut));
            }
            
            // Actual worked minutes in morning
            $actualIn = $morningIn->greaterThan($morningTargetIn) ? $morningIn : $morningTargetIn;
            $actualOut = $morningOut->lessThan($morningTargetOut) ? $morningOut : $morningTargetOut;
            if ($actualOut->greaterThan($actualIn)) {
                $totalMinutesWorked += abs($actualIn->diffInMinutes($actualOut));
            }
        }

        // Afternoon Shift Computation
        if ($afternoonIn) {
            // Late
            if ($afternoonIn->greaterThan($afternoonTargetIn)) {
                $lateMinutes += abs($afternoonIn->diffInMinutes($afternoonTargetIn));
            }
        }

        if ($afternoonIn && $afternoonOut) {
            // Undertime
            if ($afternoonOut->lessThan($afternoonTargetOut)) {
                $undertimeMinutes += abs($afternoonOut->diffInMinutes($afternoonTargetOut));
            }
            
            // Overtime (if they time out after 4:00 PM)
            if ($afternoonOut->greaterThan($afternoonTargetOut)) {
                $overtimeMinutes += abs($afternoonOut->diffInMinutes($afternoonTargetOut));
            }
            
            // Actual worked minutes in afternoon
            $actualIn = $afternoonIn->greaterThan($afternoonTargetIn) ? $afternoonIn : $afternoonTargetIn;
            $actualOut = $afternoonOut->lessThan($afternoonTargetOut) ? $afternoonOut : $afternoonTargetOut;
            if ($actualOut->greaterThan($actualIn)) {
                $totalMinutesWorked += abs($actualIn->diffInMinutes($actualOut));
            }
        }

        $attendance->late_minutes = $lateMinutes;
        $attendance->undertime_minutes = $undertimeMinutes;
        $attendance->overtime_minutes = $overtimeMinutes;
        $attendance->total_work_hours = $totalMinutesWorked / 60;
        
        // Determine status
        if ($totalMinutesWorked >= 8 * 60) {
            $attendance->status = 'Present';
        } elseif ($totalMinutesWorked > 0 && $totalMinutesWorked <= 4 * 60) {
            $attendance->status = 'Half Day';
        } elseif ($totalMinutesWorked > 4 * 60 && $totalMinutesWorked < 8 * 60) {
            $attendance->status = $lateMinutes > 0 ? 'Late' : 'Present'; // Late or just undertime
        } elseif ($morningIn || $afternoonIn) {
            // They have punched in but calculation is 0 (likely because they haven't punched out yet)
            $attendance->status = $lateMinutes > 0 ? 'Late' : 'Present'; 
        } else {
            $attendance->status = 'Absent';
        }

        $attendance->save();
    }
}
