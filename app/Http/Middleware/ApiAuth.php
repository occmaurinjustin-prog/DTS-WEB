<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token required',
            ], 401);
        }

        $user = \App\Models\User::where('remember_token', hash('sha256', $token))->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is inactive',
            ], 403);
        }

        // Login the user using Auth facade
        Auth::login($user);
        
        // Also add to request
        $request->merge(['auth_user' => $user]);
        $request->setUserResolver(fn() => $user);

        return $next($request);
    }
}
