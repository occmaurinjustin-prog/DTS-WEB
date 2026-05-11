<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class OfficeStaffLoginController extends Controller
{
    public function showLoginForm()
    {
        return inertia('OfficeStaff/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $credentials['username'])->first();

        if (!$user || $user->role !== 'office_staff') {
            return back()->withErrors([
                'username' => 'Invalid credentials or access denied.',
            ]);
        }

        if (!Hash::check($credentials['password'], $user->password)) {
            return back()->withErrors([
                'username' => 'Invalid credentials or access denied.',
            ]);
        }

        if (!$user->is_active) {
            return back()->withErrors([
                'username' => 'Your account is inactive. Please contact administrator.',
            ]);
        }

        Auth::login($user);
        // Don't regenerate session to allow concurrent logins

        return redirect()->route('office_staff.dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        // Only flush specific user data, don't invalidate entire session
        $request->session()->forget(['user_id', 'role', 'auth_user']);

        return redirect()->route('office_staff.login');
    }
}
