<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class EnsurePasswordIsChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Disabled forced password change so users can decide when to change it
        // if (Auth::check() && !Auth::user()->exchangepassword) {
        //     // If they are not already trying to change their password
        //     if (!$request->is('force-change-password') && !$request->is('api/*')) {
        //         return redirect()->route('password.force-change');
        //     }
        // }

        return $next($request);
    }
}
