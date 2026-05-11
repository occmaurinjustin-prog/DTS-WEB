<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Attendance;
use App\Models\PayrollRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $employees = User::where('role', 'office_staff')
            ->where('is_active', true)
            ->get();

        $mechanics = User::where('role', 'mechanic')
            ->where('is_active', true)
            ->get();

        $todayAttendance = Attendance::where(function ($q) {
                $q->whereDate('date', Carbon::today())
                  ->orWhereDate('time_In', Carbon::today())
                  ->orWhere(function ($sq) {
                      $sq->where('status', 'on_leave')
                         ->whereDate('created_at', Carbon::today());
                  });
            })
            ->with('user')
            ->get()
            ->map(function ($attend) {
                $u = $attend->user;
                return [
                    'attend_id' => $attend->attend_id,
                    'user_id' => $attend->user_id,
                    'extension_no' => $u->extension_no ?? '-',
                    'name' => trim(($u->firstname ?? '') . ' ' . ($u->lastname ?? '')) ?: ($u->username ?? '-'),
                    'role' => $u->role === 'mechanic' ? 'Mechanic' : 'Office Staff',
                    'time_In' => $attend->time_In ? Carbon::parse($attend->time_In)->format('h:i:s A') : '-',
                    'time_out' => $attend->time_out ? Carbon::parse($attend->time_out)->format('h:i:s A') : '-',
                    'status' => $attend->status ?? ($attend->time_out ? 'completed' : ($attend->time_In ? 'in' : 'absent')),
                ];
            });

        // Calculate real payroll summary from today's attendance
        $presentCount = $todayAttendance->where('status', 'in')->count() + $todayAttendance->where('status', 'completed')->count();
        $dailyRate = 500;
        $totalPayroll = $presentCount * $dailyRate;

        $payrollSummary = [
            'daily_rate' => (string) $dailyRate,
            'working_days' => (string) $presentCount,
            'total_payroll' => number_format($totalPayroll),
        ];

        return inertia('OfficeStaff/Attendance', [
            'authUser' => $user,
            'employees' => $employees,
            'mechanics' => $mechanics,
            'todayAttendance' => $todayAttendance,
            'payrollSummary' => $payrollSummary,
        ]);
    }

    public function timeIn(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,user_id',
        ]);

        $existing = Attendance::where('user_id', $validated['user_id'])
            ->whereDate('date', Carbon::today())
            ->first();

        if ($existing) {
            return back()->withErrors(['message' => 'Employee already clocked in today.']);
        }

        Attendance::create([
            'user_id' => $validated['user_id'],
            'date' => Carbon::today(),
            'time_In' => Carbon::now(),
            'status' => 'in',
            'attendance_type' => 'whole_day',
        ]);

        return back()->with('success', 'Time in recorded successfully.');
    }

    public function timeOut(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,user_id',
        ]);

        $attendance = Attendance::where('user_id', $validated['user_id'])
            ->whereDate('date', Carbon::today())
            ->where('status', 'in')
            ->first();

        if (!$attendance) {
            return back()->withErrors(['message' => 'No active time-in record found for this employee today.']);
        }

        $attendance->update([
            'time_out' => Carbon::now(),
            'status' => 'completed',
        ]);

        return back()->with('success', 'Time out recorded successfully.');
    }

    public function addLeave(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'leave_type' => 'required|string',
            'date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        Attendance::create([
            'user_id' => $validated['user_id'],
            'date' => $validated['date'],
            'time_In' => null,
            'time_out' => null,
            'status' => 'on_leave',
            'attendance_type' => 'leave',
            'leave_type' => $validated['leave_type'],
            'leave_note' => $validated['note'],
        ]);

        return back()->with('success', 'Leave recorded successfully.');
    }

    public function mechanics()
    {
        $user = Auth::user();

        $mechanics = User::where('role', 'mechanic')
            ->orderBy('lastname')
            ->get();

        return inertia('OfficeStaff/Mechanics', [
            'authUser' => $user,
            'mechanics' => $mechanics,
        ]);
    }

    public function storeMechanic(Request $request)
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'contact_number' => 'nullable|string|size:11|regex:/^[0-9]{11}$/',
            'address' => 'nullable|string|max:255',
            'extension_no' => 'nullable|string|max:50|unique:users,extension_no',
        ]);

        $username = strtolower($validated['firstname'] . '.' . $validated['lastname']);
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $username = strtolower($validated['firstname'] . '.' . $validated['lastname']) . $counter;
            $counter++;
        }

        User::create([
            'username' => $username,
            'password' => bcrypt('mechanic123'),
            'role' => 'mechanic',
            'is_active' => true,
            'firstname' => $validated['firstname'],
            'middle_name' => $validated['middle_name'],
            'lastname' => $validated['lastname'],
            'contact_number' => $validated['contact_number'],
            'address' => $validated['address'],
            'extension_no' => $validated['extension_no'],
        ]);

        return back()->with('success', 'Mechanic added successfully.');
    }

    public function payroll(Request $request)
    {
        $user = Auth::user();

        // Get pay period from request or default to current month
        $payPeriodStart = $request->input('pay_period_start', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $payPeriodEnd = $request->input('pay_period_end', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // Get employees and mechanics for payroll
        $employees = User::whereIn('role', ['office_staff', 'mechanic'])
            ->where('is_active', true)
            ->orderBy('lastname')
            ->get();

        // Calculate working days up to today only (excluding weekends and future dates)
        $workingDays = $this->calculateWorkingDays($payPeriodStart, $payPeriodEnd);

        // Get or calculate payroll data for each employee - ALWAYS use real attendance data
        $payrollData = $employees->map(function ($emp) use ($payPeriodStart, $payPeriodEnd, $workingDays) {
            // Check if there's a PAID payroll record (use stored data for paid records)
            $payrollRecord = PayrollRecord::where('user_id', $emp->user_id)
                ->where('pay_period_start', $payPeriodStart)
                ->where('pay_period_end', $payPeriodEnd)
                ->where('status', 'paid')
                ->first();

            if ($payrollRecord) {
                // For paid records, use stored data
                return [
                    'user_id' => $emp->user_id,
                    'name' => trim(($emp->firstname ?? '') . ' ' . ($emp->lastname ?? '')) ?: $emp->username,
                    'role' => $emp->role === 'mechanic' ? 'Mechanic' : 'Office Staff',
                    'extension_no' => $emp->extension_no ?? '-',
                    'daily_rate' => (float) $payrollRecord->daily_rate,
                    'working_days' => (int) $payrollRecord->working_days,
                    'present_days' => (int) $payrollRecord->present_days,
                    'whole_day' => (int) ($payrollRecord->whole_day ?? 0),
                    'half_day' => (int) ($payrollRecord->half_day ?? 0),
                    'absent_days' => (int) $payrollRecord->absent_days,
                    'late_days' => (int) $payrollRecord->late_days,
                    'gross_pay' => (float) $payrollRecord->gross_pay,
                    'deductions' => (float) $payrollRecord->total_deductions,
                    'deductions_absent' => (float) $payrollRecord->deductions_absent,
                    'deductions_late' => (float) $payrollRecord->deductions_late,
                    'deductions_others' => (float) $payrollRecord->deductions_others,
                    'net_pay' => (float) $payrollRecord->net_pay,
                    'status' => 'paid',
                    'payment_method' => $payrollRecord->payment_method,
                    'paid_at' => $payrollRecord->paid_at,
                ];
            }

            // ALWAYS calculate from real attendance records for pending/unprocessed
            $attendanceStats = $this->calculateAttendanceStats($emp->user_id, $payPeriodStart, $payPeriodEnd);

            $dailyRate = 500;
            $wholeDay = $attendanceStats['whole_day'];
            $halfDay = $attendanceStats['half_day'];
            $absentDays = $attendanceStats['absent_days'];
            $lateDays = $attendanceStats['late_days'];

            // Calculate pay: whole day = full rate, half day = half rate
            $grossPay = ($wholeDay * $dailyRate) + ($halfDay * $dailyRate * 0.5);
            $deductionsAbsent = $dailyRate * $absentDays;
            $deductionsLate = $dailyRate * 0.1 * $lateDays; // 10% deduction per late
            $deductionsOthers = 0;
            $totalDeductions = $deductionsAbsent + $deductionsLate + $deductionsOthers;
            $netPay = max(0, $grossPay - $totalDeductions);

            // Save/update pending payroll record to database so data is always in sync
            PayrollRecord::updateOrCreate(
                [
                    'user_id' => $emp->user_id,
                    'pay_period_start' => $payPeriodStart,
                    'pay_period_end' => $payPeriodEnd,
                ],
                [
                    'working_days' => $workingDays,
                    'present_days' => $wholeDay + $halfDay,
                    'whole_day' => $wholeDay,
                    'half_day' => $halfDay,
                    'absent_days' => $absentDays,
                    'late_days' => $lateDays,
                    'daily_rate' => $dailyRate,
                    'gross_pay' => $grossPay,
                    'deductions_absent' => $deductionsAbsent,
                    'deductions_late' => $deductionsLate,
                    'deductions_others' => $deductionsOthers,
                    'total_deductions' => $totalDeductions,
                    'net_pay' => $netPay,
                    'status' => 'pending',
                    'processed_by' => auth()->user()->username ?? 'System',
                ]
            );

            return [
                'user_id' => $emp->user_id,
                'name' => trim(($emp->firstname ?? '') . ' ' . ($emp->lastname ?? '')) ?: $emp->username,
                'role' => $emp->role === 'mechanic' ? 'Mechanic' : 'Office Staff',
                'extension_no' => $emp->extension_no ?? '-',
                'daily_rate' => $dailyRate,
                'working_days' => $workingDays,
                'present_days' => $wholeDay + $halfDay,
                'whole_day' => $wholeDay,
                'half_day' => $halfDay,
                'absent_days' => $absentDays,
                'late_days' => $lateDays,
                'gross_pay' => $grossPay,
                'deductions' => $totalDeductions,
                'deductions_absent' => $deductionsAbsent,
                'deductions_late' => $deductionsLate,
                'deductions_others' => $deductionsOthers,
                'net_pay' => $netPay,
                'status' => 'pending',
                'payment_method' => null,
                'paid_at' => null,
            ];
        });

        $payrollSummary = [
            'total_employees' => $employees->count(),
            'total_working_days' => $workingDays,
            'total_payroll' => $payrollData->sum('net_pay'),
            'paid_employees' => $payrollData->where('status', 'paid')->count(),
            'pending_employees' => $payrollData->where('status', 'pending')->count(),
            'gross_total' => $payrollData->sum('gross_pay'),
            'total_deductions' => $payrollData->sum('deductions'),
        ];

        $deductionsBreakdown = [
            'late' => $payrollData->sum('deductions_late'),
            'absent' => $payrollData->sum('deductions_absent'),
            'others' => $payrollData->sum('deductions_others'),
        ];

        // Get real payment history
        $paymentHistory = PayrollRecord::where('status', 'paid')
            ->select('pay_period_start', 'pay_period_end', 'paid_at', 'processed_by', DB::raw('SUM(net_pay) as total_paid'))
            ->groupBy('pay_period_start', 'pay_period_end', 'paid_at', 'processed_by')
            ->orderBy('paid_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($record) {
                return [
                    'date' => $record->paid_at ? $record->paid_at->format('Y-m-d') : null,
                    'pay_period' => Carbon::parse($record->pay_period_start)->format('M d') . ' - ' . Carbon::parse($record->pay_period_end)->format('M d, Y'),
                    'total_paid' => (float) $record->total_paid,
                    'processed_by' => $record->processed_by ?? 'Admin',
                ];
            });

        return inertia('OfficeStaff/Payroll', [
            'authUser' => $user,
            'employees' => $employees,
            'payrollData' => $payrollData,
            'payrollSummary' => $payrollSummary,
            'currentPeriod' => [
                'start' => $payPeriodStart,
                'end' => $payPeriodEnd,
            ],
            'paymentHistory' => $paymentHistory,
            'deductionsBreakdown' => $deductionsBreakdown,
        ]);
    }

    private function calculateWorkingDays($start, $end)
    {
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);
        $today = Carbon::today();
        $workingDays = 0;

        while ($startDate <= $endDate) {
            // Exclude weekends (0 = Sunday, 6 = Saturday)
            // Also exclude future dates - only count up to today
            if ($startDate->dayOfWeek !== 0 && $startDate->dayOfWeek !== 6 && !$startDate->isFuture()) {
                $workingDays++;
            }
            $startDate->addDay();
        }

        return $workingDays;
    }

    private function calculateAttendanceStats($userId, $start, $end)
    {
        $startDate = Carbon::parse($start)->startOfDay();
        $endDate = Carbon::parse($end)->endOfDay();
        $today = Carbon::today();

        // Get all attendance records for the period
        $attendanceRecords = Attendance::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->keyBy(function ($record) {
                return $record->date->format('Y-m-d');
            });

        $presentDays = 0;
        $wholeDay = 0;
        $halfDay = 0;
        $lateDays = 0;
        $absentDays = 0;

        // Iterate through each working day
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if ($currentDate->dayOfWeek !== 0 && $currentDate->dayOfWeek !== 6) {
                $dateStr = $currentDate->format('Y-m-d');
                $record = $attendanceRecords->get($dateStr);

                // Skip future dates - don't count them at all
                if ($currentDate->isFuture()) {
                    $currentDate->addDay();
                    continue;
                }

                // For today: if no time-in yet, don't count as anything (pending)
                if ($currentDate->isToday()) {
                    if ($record && $record->time_In) {
                        $presentDays++;
                        // Check attendance type
                        if ($record->attendance_type === 'whole_day') {
                            $wholeDay++;
                        } elseif ($record->attendance_type === 'half_day') {
                            $halfDay++;
                        } else {
                            $wholeDay++; // Default to whole day
                        }
                        // Check if late
                        $timeIn = Carbon::parse($record->time_In);
                        if ($timeIn->hour > 9 || ($timeIn->hour === 9 && $timeIn->minute > 0)) {
                            $lateDays++;
                        }
                    }
                    // If no time-in yet today, don't count as absent (still pending)
                    $currentDate->addDay();
                    continue;
                }

                // For past dates: count based on attendance record
                if ($record) {
                    if ($record->status === 'on_leave') {
                        // Leave days count as 1 absent (unpaid leave)
                        $absentDays++;
                    } elseif ($record->time_In) {
                        $presentDays++;
                        // Check attendance type
                        if ($record->attendance_type === 'whole_day') {
                            $wholeDay++;
                        } elseif ($record->attendance_type === 'half_day') {
                            $halfDay++;
                        } else {
                            $wholeDay++; // Default to whole day
                        }
                        // Check if late (after 9:00 AM)
                        $timeIn = Carbon::parse($record->time_In);
                        if ($timeIn->hour > 9 || ($timeIn->hour === 9 && $timeIn->minute > 0)) {
                            $lateDays++;
                        }
                    }
                    // Note: No else clause - absent defaults to 0
                }
                // Note: No attendance record = not counted (0 absent by default)
            }
            $currentDate->addDay();
        }

        return [
            'present_days' => $presentDays,
            'whole_day' => $wholeDay,
            'half_day' => $halfDay,
            'absent_days' => $absentDays,
            'late_days' => $lateDays,
        ];
    }

    public function runPayroll(Request $request)
    {
        $validated = $request->validate([
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date',
            'employee_type' => 'required|in:all,mechanics,staff',
            'daily_rate' => 'required|numeric|min:1',
        ]);

        $user = Auth::user();

        // Build employee query based on type
        $employeeQuery = User::where('is_active', true);
        if ($validated['employee_type'] === 'mechanics') {
            $employeeQuery->where('role', 'mechanic');
        } elseif ($validated['employee_type'] === 'staff') {
            $employeeQuery->where('role', 'office_staff');
        } else {
            $employeeQuery->whereIn('role', ['office_staff', 'mechanic']);
        }

        $employees = $employeeQuery->get();
        $workingDays = $this->calculateWorkingDays($validated['pay_period_start'], $validated['pay_period_end']);

        // Create or update payroll records for each employee
        foreach ($employees as $emp) {
            $attendanceStats = $this->calculateAttendanceStats($emp->user_id, $validated['pay_period_start'], $validated['pay_period_end']);

            $dailyRate = $validated['daily_rate'];
            $wholeDay = $attendanceStats['whole_day'];
            $halfDay = $attendanceStats['half_day'];
            $absentDays = $attendanceStats['absent_days'];
            $lateDays = $attendanceStats['late_days'];

            // Calculate pay: whole day = full rate, half day = half rate
            $grossPay = ($wholeDay * $dailyRate) + ($halfDay * $dailyRate * 0.5);
            $deductionsAbsent = $dailyRate * $absentDays;
            $deductionsLate = $dailyRate * 0.1 * $lateDays;
            $deductionsOthers = 0;
            $totalDeductions = $deductionsAbsent + $deductionsLate + $deductionsOthers;
            $netPay = max(0, $grossPay - $totalDeductions);

            // Create or update payroll record
            PayrollRecord::updateOrCreate(
                [
                    'user_id' => $emp->user_id,
                    'pay_period_start' => $validated['pay_period_start'],
                    'pay_period_end' => $validated['pay_period_end'],
                ],
                [
                    'working_days' => $workingDays,
                    'present_days' => $wholeDay + $halfDay,
                    'whole_day' => $wholeDay,
                    'half_day' => $halfDay,
                    'absent_days' => $absentDays,
                    'late_days' => $lateDays,
                    'daily_rate' => $dailyRate,
                    'gross_pay' => $grossPay,
                    'deductions_absent' => $deductionsAbsent,
                    'deductions_late' => $deductionsLate,
                    'deductions_others' => $deductionsOthers,
                    'total_deductions' => $totalDeductions,
                    'net_pay' => $netPay,
                    'status' => 'pending',
                    'processed_by' => $user->username ?? 'Admin',
                ]
            );
        }

        return redirect()->route('office_staff.payroll', [
            'pay_period_start' => $validated['pay_period_start'],
            'pay_period_end' => $validated['pay_period_end'],
        ])->with('success', 'Payroll calculated successfully for ' . $employees->count() . ' employees.');
    }

    public function confirmPayroll(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,bank,gcash',
            'payroll_ids' => 'nullable|array',
        ]);

        $user = Auth::user();

        // Mark payroll records as paid
        $query = PayrollRecord::where('status', 'pending');

        // If specific IDs provided, filter by them
        if (!empty($validated['payroll_ids'])) {
            $query->whereIn('payroll_record_id', $validated['payroll_ids']);
        }

        $updated = $query->update([
            'status' => 'paid',
            'payment_method' => $validated['payment_method'],
            'paid_at' => now(),
            'processed_by' => $user->username ?? 'Admin',
        ]);

        return back()->with('success', 'Payroll marked as paid successfully. ' . $updated . ' employees processed.');
    }
}
