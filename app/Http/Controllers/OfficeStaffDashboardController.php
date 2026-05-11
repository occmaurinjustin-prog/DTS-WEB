<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OfficeStaffDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get statistics for office staff dashboard
        $stats = [
            'total_clients' => Client::count(),
            'total_inquiries' => 0, // Inquiries table deleted
            'pending_inquiries' => 0,
            'in_progress_inquiries' => 0,
            'closed_inquiries' => 0,
        ];

        // Get recent inquiries (empty since table deleted)
        $recentInquiries = collect();
        $myInquiries = collect();

        return inertia('OfficeStaff/Dashboard', [
            'authUser' => $user,
            'userInfo' => $user,
            'officeStaff' => $user,
            'stats' => $stats,
            'recentInquiries' => $recentInquiries,
            'myInquiries' => $myInquiries,
        ]);
    }

    public function profile()
    {
        $user = Auth::user();

        return inertia('OfficeStaff/Profile', [
            'authUser' => $user,
            'userInfo' => $user,
            'officeStaff' => $user,
        ]);
    }
}
