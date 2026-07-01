<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class FaceRegistrationController extends Controller
{
    /**
     * Show face registration status.
     */
    public function show(User $user)
    {
        return response()->json([
            'is_registered' => $user->face_status === 'Registered',
            'status' => $user->face_status,
            'registered_at' => $user->face_registered_at,
        ]);
    }

    /**
     * Web endpoint to delete face registration (if needed).
     */
    public function destroy(User $user)
    {
        if ($user->faceRegistration) {
            $user->faceRegistration->delete();
        }

        $user->update([
            'face_status' => 'Not Registered',
            'face_registered_at' => null,
            'face_encoding' => null,
        ]);

        return redirect()->back()->with('success', 'Face registration deleted successfully.');
    }
}
