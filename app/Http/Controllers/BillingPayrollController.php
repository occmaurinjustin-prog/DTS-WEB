<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use Illuminate\Http\Request;

class BillingPayrollController extends Controller
{
    public function index()
    {
        $payrolls = Payroll::with('user')->orderBy('period_start', 'desc')->get();

        return inertia('Billing/Payroll', [
            'payrolls' => $payrolls,
        ]);
    }

    public function markAsPaid($id)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->update(['status' => 'paid']);

        return redirect()->back()->with('success', 'Payroll marked as paid successfully!');
    }
}
