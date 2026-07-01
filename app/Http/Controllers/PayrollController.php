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
        $payrolls = Payroll::with('user')->orderBy('period_start', 'desc')->get();
        $mechanics = User::where('role', 'mechanic')->get();

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
}
