<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PasswordChangeController extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('Auth/ForceChangePassword', [
            'isForced' => !(bool) $request->user()->exchangepassword
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->password);
        $user->exchangepassword = true; // 1 = exchanged (done)
        $user->save();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json(['success' => true, 'message' => 'Password updated successfully']);
        }

        return redirect()->intended('/')->with('success', 'Password changed successfully!');
    }
}
