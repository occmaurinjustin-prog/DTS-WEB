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
        $totalLateMinutes = $attendances->sum('late_minutes');

        $grossSalary = $totalHours * $hourlyRate;

        // Deductions
        // 1. Late Penalty: Pro-rated based on the hourly rate
        $latePenaltyPerMinute = $hourlyRate / 60;
        $latePenaltyAmount = $totalLateMinutes * $latePenaltyPerMinute;

        // 2. Flat Tax: 5% of gross salary
        $taxDeductionAmount = $grossSalary * 0.05;

        $totalDeductions = $latePenaltyAmount + $taxDeductionAmount;
        $netSalary = $grossSalary - $totalDeductions;

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
        // Earnings - Regular Hours
        $payroll->details()->create([
            'type' => 'earnings',
            'category' => 'regular_hours',
            'description' => 'Regular Worked Hours',
            'hours' => $totalHours,
            'rate' => $hourlyRate,
            'amount' => round($grossSalary, 2),
        ]);

        // Deductions - Late Penalty
        if ($latePenaltyAmount > 0) {
            $payroll->details()->create([
                'type' => 'deductions',
                'category' => 'late_penalty',
                'description' => "Late Penalty ({$totalLateMinutes} mins)",
                'hours' => round($totalLateMinutes / 60, 2),
                'rate' => round($hourlyRate, 2),
                'amount' => round($latePenaltyAmount, 2),
            ]);
        }

        // Deductions - Flat Tax
        if ($taxDeductionAmount > 0) {
            $payroll->details()->create([
                'type' => 'deductions',
                'category' => 'tax',
                'description' => 'Flat Tax Deduction (5%)',
                'hours' => null,
                'rate' => null,
                'amount' => round($taxDeductionAmount, 2),
            ]);
        }

        return $payroll;
    }
}
