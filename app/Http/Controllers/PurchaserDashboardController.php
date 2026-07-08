<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PurchaserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Basic stats for Purchaser dashboard
        $stats = [
            'total_orders' => 0,
            'pending_orders' => 0,
            'approved_orders' => 0,
        ];

        return inertia('Purchaser/Dashboard', [
            'authUser' => $user,
            'stats' => $stats,
        ]);
    }
}
