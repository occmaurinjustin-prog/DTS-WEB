<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PurchaserDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $partRequests = \App\Models\PartRequest::with(['mechanic', 'inventory'])
            ->whereIn('status', ['approved', 'purchased', 'completed'])
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total_orders' => $partRequests->count(),
            'pending_purchase' => $partRequests->where('status', 'approved')->count(),
            'purchased' => $partRequests->where('status', 'purchased')->count(),
        ];

        return inertia('Purchaser/Dashboard', [
            'authUser' => $user,
            'stats' => $stats,
        ]);
    }

    public function orders()
    {
        $user = Auth::user();

        $partRequests = \App\Models\PartRequest::with(['mechanic', 'inventory'])
            ->whereIn('status', ['approved', 'purchased', 'completed'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Purchaser/Orders', [
            'authUser' => $user,
            'partRequests' => $partRequests
        ]);
    }
}
