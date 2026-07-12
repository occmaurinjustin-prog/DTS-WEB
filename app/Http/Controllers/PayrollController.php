<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Services\PayrollService;
use App\Http\Requests\PayrollRequest;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function index()
    {
        $payrolls = Payroll::with(['user', 'details'])->orderBy('period_start', 'desc')->get();
        $mechanics = User::where('role', 'mechanic')->where('is_active', true)->get();

        return inertia('OfficeStaff/Payroll', [
            'payrolls' => $payrolls,
            'mechanics' => $mechanics,
        ]);
    }

    public function generate(PayrollRequest $request)
    {
        $user = User::findOrFail($request->user_id);
        
        try {
            $payroll = $this->payrollService->generatePayroll(
                $user,
                $request->period_start,
                $request->period_end,
                $request->hourly_rate
            );

            return redirect()->back()->with('success', 'Payroll generated successfully for ' . $user->firstname);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function generateAll(Request $request)
    {
        $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'hourly_rate' => 'required|numeric|min:62.50',
        ]);

        $mechanics = User::where('role', 'mechanic')->get();
        $generatedCount = 0;
        $failedCount = 0;

        foreach ($mechanics as $mechanic) {
            try {
                $this->payrollService->generatePayroll(
                    $mechanic,
                    $request->period_start,
                    $request->period_end,
                    $request->hourly_rate
                );
                $generatedCount++;
            } catch (\Exception $e) {
                $failedCount++;
            }
        }

        if ($generatedCount === 0) {
            return redirect()->back()->withErrors(['error' => "Could not generate any payrolls. Make sure mechanics have attendance records for this period."]);
        }

        return redirect()->back()->with('success', "Successfully generated payroll for {$generatedCount} mechanics." . ($failedCount > 0 ? " ({$failedCount} skipped due to no attendance)" : ""));
    }
    public function markAsPaid($id)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->update(['status' => 'paid']);

        return redirect()->back()->with('success', 'Payroll marked as paid successfully!');
    }
}
