<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MechanicController extends Controller
{
    /**
     * Login mechanic using unique_id only (no password required)
     */
    public function login(Request $request)
    {
        \Log::info('Mechanic login attempt', ['unique_id' => $request->input('unique_id')]);

        try {
            $data = $request->validate([
                'unique_id' => 'required|string|max:255',
            ]);

            \Log::info('Validation passed', ['unique_id' => $data['unique_id']]);

            $uniqueId = $data['unique_id'];

            // Find mechanic by unique_id
            $mechanic = User::where('unique_id', $uniqueId)
                ->where('role', 'mechanic')
                ->first();

            if (!$mechanic) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Unique ID. Please check and try again.'
                ], 404);
            }

            // Check if mechanic is active
            if (!$mechanic->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is inactive. Please contact administrator.'
                ], 403);
            }

            // Generate simple token (in production, use JWT or Sanctum)
            $token = base64_encode($mechanic->user_id . ':' . time() . ':' . uniqid());

            // Return mechanic data
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'mechanic' => [
                    'user_id' => $mechanic->user_id,
                    'unique_id' => $mechanic->unique_id,
                    'first_name' => $mechanic->first_name,
                    'last_name' => $mechanic->last_name,
                    'email' => $mechanic->email,
                    'phone' => $mechanic->phone,
                    'role' => $mechanic->role,
                    'face_descriptor' => $mechanic->face_descriptor,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Mechanic login error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login'
            ], 500);
        }
    }

    /**
     * Get mechanic details by unique_id
     */
    public function show($uniqueId)
    {
        try {
            $mechanic = User::where('unique_id', $uniqueId)
                ->where('role', 'mechanic')
                ->first();

            if (!$mechanic) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mechanic not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'mechanic' => [
                    'user_id' => $mechanic->user_id,
                    'unique_id' => $mechanic->unique_id,
                    'first_name' => $mechanic->first_name,
                    'last_name' => $mechanic->last_name,
                    'email' => $mechanic->email,
                    'phone' => $mechanic->phone,
                    'role' => $mechanic->role,
                    'is_active' => $mechanic->is_active,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Get mechanic error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred'
            ], 500);
        }
    }
}
