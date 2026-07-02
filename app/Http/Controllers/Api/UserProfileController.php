<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class UserProfileController extends Controller
{
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
        ]);

        $user = Auth::user();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $path = $request->file('image')->store('profile_images', 'public');
            
            $user->profile_image = $path;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profile image updated successfully',
                'profile_image_url' => asset('storage/' . $path),
                'user' => $user
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No image provided'], 400);
    }

    public function deleteImage()
    {
        $user = Auth::user();

        if ($user->profile_image) {
            Storage::disk('public')->delete($user->profile_image);
            $user->profile_image = null;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profile image deleted successfully',
                'user' => $user
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No image to delete'], 400);
    }
}
