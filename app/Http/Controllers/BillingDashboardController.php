<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillingDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Basic stats for Billing dashboard
        $stats = [
            'pending_invoices' => 0,
            'paid_invoices' => 0,
            'total_revenue' => 0,
        ];

        return inertia('Billing/Dashboard', [
            'authUser' => $user,
            'stats' => $stats,
        ]);
    }
}
