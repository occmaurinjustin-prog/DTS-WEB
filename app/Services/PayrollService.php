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

        // Check if a paid payroll already exists for this period
        $existingPayroll = Payroll::where('user_id', $user->user_id)
            ->where('period_start', $periodStart)
            ->where('period_end', $periodEnd)
            ->first();

        if ($existingPayroll && $existingPayroll->status === 'paid') {
            throw new Exception("Payroll for this period has already been paid and cannot be regenerated.");
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
        $totalHours = $attendances->sum('total_work_hours');
        $grossSalary = $totalHours * $hourlyRate;
        $netSalary = $grossSalary;

        // Create or Update Payroll Record
        $payroll = Payroll::updateOrCreate(
            [
                'user_id' => $user->user_id,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
            ],
            [
                'gross_salary' => round($grossSalary, 2),
                'net_salary' => round($netSalary, 2),
                'status' => 'pending',
            ]
        );

        // Clear existing details if regenerating
        $payroll->details()->delete();

        // Create details
        $payroll->details()->create([
            'type' => 'earnings',
            'category' => 'regular_hours',
            'description' => 'Regular Worked Hours',
            'hours' => $totalHours,
            'rate' => $hourlyRate,
            'amount' => round($grossSalary, 2),
        ]);

        return $payroll;
    }
}
