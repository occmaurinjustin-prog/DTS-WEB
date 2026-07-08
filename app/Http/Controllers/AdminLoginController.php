<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminLoginController extends Controller
{
    public function showLoginForm()
    {
        return inertia('Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $remember = $request->boolean('remember');

        $user = User::where('username', $credentials['username'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Invalid credentials.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Your account is inactive. Please contact administrator.'],
            ]);
        }

        // Check if user has valid role
        if (!in_array($user->role, ['admin', 'operation_manager', 'office_staff', 'mechanic', 'driver', 'purchaser', 'billing'])) {
            throw ValidationException::withMessages([
                'username' => ['Access denied. Invalid user role. Current role: ' . $user->role],
            ]);
        }

        Auth::login($user, $remember);
        
        // Don't regenerate session to allow concurrent logins
        
        // Store explicit identifiers for the Inertia middleware to pick up
        $request->session()->put('user_id', $user->id);
        $request->session()->put('role', $user->role);

        // Redirect based on user role
        if ($user->role === 'admin') {
            return redirect()->intended(route('admin.dashboard'));
        } elseif ($user->role === 'office_staff') {
            return redirect()->intended(route('office_staff.dashboard'));
        } elseif ($user->role === 'operation_manager') {
            return redirect()->intended(route('operational_manager.dashboard'));
        } elseif ($user->role === 'purchaser') {
            return redirect()->intended(route('purchaser.dashboard'));
        } elseif ($user->role === 'billing') {
            return redirect()->intended(route('billing.dashboard'));
        }

        return redirect()->intended('/');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        // Only flush specific user data, don't invalidate entire session
        $request->session()->forget(['user_id', 'role', 'auth_user']);

        return redirect('/');
    }
}
