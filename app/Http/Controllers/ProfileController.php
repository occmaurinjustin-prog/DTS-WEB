<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Show the profile page for any web user role.
     */
    public function show(Request $request)
    {
        return inertia('Shared/Profile', [
            'authUser' => $request->user(),
            // Send the user's role layout prefix to properly render the sidebar
            'layoutType' => $this->getLayoutForRole($request->user()->role)
        ]);
    }

    /**
     * Update basic profile information.
     */
    public function updateInformation(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->user_id . ',user_id'],
            'contact_number' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update($validated);

        return back()->with('success', 'Profile information updated successfully.');
    }

    /**
     * Update profile picture.
     */
    public function updatePicture(Request $request)
    {
        $request->validate([
            'profile_image' => ['required', 'image', 'max:2048'], // max 2MB
        ]);

        $user = $request->user();

        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($user->profile_image) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->profile_image));
            }

            $path = $request->file('profile_image')->store('profile_pictures', 'public');
            
            $user->update([
                'profile_image' => '/storage/' . $path
            ]);
        }

        return back()->with('success', 'Profile picture updated successfully.');
    }

    /**
     * Update password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Determine layout component based on role.
     */
    private function getLayoutForRole($role)
    {
        switch ($role) {
            case 'admin':
                return 'AdminLayout';
            case 'operation_manager':
                return 'OperationalManagerLayout';
            case 'office_staff':
                return 'OfficeStaffLayout';
            case 'billing':
                return 'BillingLayout';
            case 'purchaser':
                return 'PurchaserLayout';
            default:
                return 'GuestLayout';
        }
    }
}
