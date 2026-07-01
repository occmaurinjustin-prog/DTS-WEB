<?php

namespace App\Services;

use App\Models\Payroll;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Exception;

class PayrollService
{
    /**
     * Generate payroll for a user within a specific period.
     */
    public function generatePayroll(User $user, $periodStart, $periodEnd, $hourlyRate): Payroll
    {
        // Enforce Minimum Salary Wage (500 / 8 = 62.50)
        $minimumHourlyRate = 62.50;
        if ($hourlyRate < $minimumHourlyRate) {
            $hourlyRate = $minimumHourlyRate;
        }

        // Get all attendances for the period where the user was actually present
        $attendances = Attendance::where('user_id', $user->user_id)
            ->whereBetween('attendance_date', [$periodStart, $periodEnd])
            ->whereIn('status', ['Present', 'Late', 'Half Day'])
            ->get();

        if ($attendances->isEmpty()) {
            throw new Exception("No valid attendance records found for this user in the specified period.");
        }

        // Calculations
        $lateMinutes = $attendances->sum('late_minutes');
        $undertimeMinutes = $attendances->sum('undertime_minutes');
        $overtimeMinutes = $attendances->sum('overtime_minutes');

        // Deductions (Deduct per minute of late/undertime)
        $deductionPerMinute = $hourlyRate / 60;
        $deductions = ($lateMinutes + $undertimeMinutes) * $deductionPerMinute;

        // Overtime Pay (1.5x Hourly Rate)
        $overtimeHours = $overtimeMinutes / 60;
        $overtimePay = $overtimeHours * ($hourlyRate * 1.5);

        // The Total Hours stored should strictly match the actual worked hours from Attendance.
        $totalHours = $attendances->sum('total_work_hours');
        
        // Gross Salary is based purely on the actual hours they worked.
        // Because the actual hours worked already EXCLUDES late and undertime minutes,
        // we do NOT subtract deductions from the Gross Salary again (otherwise we double deduct).
        $grossSalary = $totalHours * $hourlyRate;

        // Compute Net Salary: Gross + Overtime. 
        // (Deductions are recorded purely for the payslip display so the employee knows how much they lost).
        $netSalary = $grossSalary + $overtimePay;

        // Create or Update Payroll Record
        return Payroll::updateOrCreate(
            [
                'user_id' => $user->user_id,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
            ],
            [
                'total_hours' => $totalHours,
                'hourly_rate' => $hourlyRate,
                'overtime_pay' => round($overtimePay, 2),
                'deductions' => round($deductions, 2),
                'gross_salary' => round($grossSalary, 2),
                'net_salary' => round($netSalary, 2),
                'status' => 'pending',
            ]
        );
    }
}
