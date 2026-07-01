<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        \Log::info('API Login attempt', ['username' => $request->username]);
        
        try {
            $credentials = $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            $user = User::where('username', $credentials['username'])->first();

            \Log::info('User lookup result', ['user_found' => $user ? true : false]);

            if (!$user) {
                \Log::warning('User not found', ['username' => $credentials['username']]);
                throw ValidationException::withMessages([
                    'message' => ['Invalid credentials.'],
                ]);
            }

            if (!Hash::check($credentials['password'], $user->password)) {
                \Log::warning('Password mismatch', ['username' => $credentials['username']]);
                throw ValidationException::withMessages([
                    'message' => ['Invalid credentials.'],
                ]);
            }

            if (!$user->is_active) {
                \Log::warning('User inactive', ['username' => $credentials['username']]);
                throw ValidationException::withMessages([
                    'message' => ['Your account is inactive. Please contact administrator.'],
                ]);
            }

            // Generate a simple API token
            $token = Str::random(60);
            
            // Store token in user's remember_token field
            $user->remember_token = hash('sha256', $token);
            $user->save();

            \Log::info('Login successful', ['username' => $user->username, 'role' => $user->role]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'firstname' => $user->firstname,
                    'lastname' => $user->lastname,
                    'email' => $user->email,
                    'role' => $user->role,
                    'contact_number' => $user->contact_number,
                    'is_active' => $user->is_active,
                    'must_change_password' => !(bool)$user->exchangepassword,
                ],
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            \Log::error('API Login error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        
        if ($token) {
            $user = User::where('remember_token', hash('sha256', $token))->first();
            if ($user) {
                $user->remember_token = null;
                $user->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    public function me(Request $request)
    {
        $token = $request->bearerToken();
        $user = User::where('remember_token', hash('sha256', $token))->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'email' => $user->email,
                'role' => $user->role,
                'contact_number' => $user->contact_number,
                'is_active' => $user->is_active,
            ],
        ]);
    }
}
