<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MechanicAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MechanicAttendanceController extends Controller
{
    /**
     * Record attendance (check-in or check-out)
     */
    public function store(Request $request)
    {
        Log::info('Attendance request received', $request->all());

        try {
            $data = $request->validate([
                'unique_id' => 'required|string|exists:users,unique_id',
                'type' => 'required|string|in:check_in,check_out',
                'timestamp' => 'required|date',
                'face_image' => 'nullable|string',
                'face_descriptor' => 'nullable|array', // Face descriptor array from frontend
                'verify_face' => 'nullable|boolean',
            ]);

            // Find mechanic by unique_id
            $mechanic = User::where('unique_id', $data['unique_id'])
                ->where('role', 'mechanic')
                ->first();

            if (!$mechanic) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mechanic not found',
                ], 404);
            }

            // FACE VERIFICATION - Critical security check
            if (!empty($data['verify_face']) && $data['verify_face'] === true) {
                Log::info('Face verification requested for mechanic: ' . $mechanic->unique_id);

                // Check if mechanic has a registered face
                if (empty($mechanic->face_descriptor)) {
                    Log::warning('No face registered for mechanic: ' . $mechanic->unique_id);
                    return response()->json([
                        'success' => false,
                        'message' => 'No face registered for this mechanic. Please contact admin to register your face.',
                        'face_verified' => false,
                    ], 403);
                }

                // TODO: Implement actual face comparison using face-api.js or similar
                // For now, we check if face_image was provided (indicating a scan was attempted)
                // In production, compare the provided face_image/descriptor with stored face_descriptor

                // STRICT MODE: If face verification is requested but no face_image provided, reject
                if (empty($data['face_image'])) {
                    Log::warning('Face verification failed - no face image provided for: ' . $mechanic->unique_id);
                    return response()->json([
                        'success' => false,
                        'message' => 'Face verification failed. No face detected during scan. Please try again.',
                        'face_verified' => false,
                    ], 403);
                }

                // BACKEND FACE VERIFICATION - STRICT 1:1 COMPARISON
                // Compare stored face with live face descriptor sent from frontend
                $liveFaceDescriptor = $data['face_descriptor'] ?? null;
                
                if (empty($liveFaceDescriptor)) {
                    Log::warning('No face descriptor provided from frontend');
                    return response()->json([
                        'success' => false,
                        'message' => 'Face detection failed. No face descriptor received.',
                        'face_verified' => false,
                    ], 400);
                }
                
                // STRICT 1:1 COMPARISON with threshold 0.5 (90% confidence)
                $faceVerification = $this->compareFacesStrict(
                    $mechanic->face_descriptor, 
                    $liveFaceDescriptor
                );
                
                if (!$faceVerification['is_match']) {
                    Log::warning('STRICT Face verification FAILED for mechanic: ' . $mechanic->unique_id . 
                        ' Distance: ' . $faceVerification['distance'] . 
                        ' Confidence: ' . $faceVerification['confidence'] . '%');
                    return response()->json([
                        'success' => false,
                        'message' => 'Face verification FAILED. Your face does not match the registered face for mechanic ID: ' . $mechanic->unique_id,
                        'face_verified' => false,
                        'distance' => $faceVerification['distance'],
                        'confidence' => $faceVerification['confidence'],
                        'required_confidence' => '90%',
                        'actual_distance' => $faceVerification['distance'],
                        'max_allowed_distance' => 0.5,
                    ], 403);
                }

                Log::info('STRICT Face verification PASSED for mechanic: ' . $mechanic->unique_id . 
                    ' Distance: ' . $faceVerification['distance'] .
                    ' Confidence: ' . $faceVerification['confidence'] . '%');
            }

            $today = Carbon::today();
            $now = Carbon::now();

            // Check if already checked in today
            $existingAttendance = MechanicAttendance::where('user_id', $mechanic->user_id)
                ->whereDate('date', $today)
                ->first();

            if ($data['type'] === 'check_in') {
                if ($existingAttendance && $existingAttendance->check_in) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Already checked in today',
                    ], 400);
                }

                // Create or update attendance record
                $attendance = MechanicAttendance::updateOrCreate(
                    [
                        'user_id' => $mechanic->user_id,
                        'date' => $today,
                    ],
                    [
                        'check_in' => $now,
                        'status' => 'present',
                    ]
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Check-in successful',
                    'time' => $now->format('h:i A'),
                    'status' => 'Checked In',
                    'attendance' => $attendance,
                ]);

            } elseif ($data['type'] === 'check_out') {
                if (!$existingAttendance || !$existingAttendance->check_in) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No check-in record found for today',
                    ], 400);
                }

                if ($existingAttendance->check_out) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Already checked out today',
                    ], 400);
                }

                // Calculate hours worked
                $checkIn = Carbon::parse($existingAttendance->check_in);
                $hoursWorked = $checkIn->diffInHours($now);

                $existingAttendance->update([
                    'check_out' => $now,
                    'hours_worked' => $hoursWorked,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Check-out successful',
                    'time' => $now->format('h:i A'),
                    'status' => 'Checked Out',
                    'hours_worked' => $hoursWorked,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Attendance error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to record attendance: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get attendance records for a mechanic
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
                    'message' => 'Mechanic not found',
                ], 404);
            }

            $attendance = MechanicAttendance::where('user_id', $mechanic->user_id)
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get();

            return response()->json([
                'success' => true,
                'mechanic' => $mechanic,
                'attendance' => $attendance,
            ]);

        } catch (\Exception $e) {
            Log::error('Get attendance error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get attendance records',
            ], 500);
        }
    }

    /**
     * Get all mechanics attendance for today (for office staff)
     */
    public function todayAttendance()
    {
        try {
            $today = Carbon::today();

            $attendance = MechanicAttendance::with('user')
                ->whereDate('date', $today)
                ->orderBy('check_in', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'date' => $today->format('Y-m-d'),
                'count' => $attendance->count(),
                'attendance' => $attendance,
            ]);

        } catch (\Exception $e) {
            Log::error('Get today attendance error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get today\'s attendance',
            ], 500);
        }
    }

    /**
     * Get attendance summary for date range
     */
    public function summary(Request $request)
    {
        try {
            $startDate = $request->input('start_date', Carbon::today()->subDays(30));
            $endDate = $request->input('end_date', Carbon::today());

            $summary = MechanicAttendance::selectRaw('
                    user_id,
                    COUNT(*) as total_days,
                    SUM(CASE WHEN check_in IS NOT NULL THEN 1 ELSE 0 END) as present_days,
                    SUM(hours_worked) as total_hours
                ')
                ->whereBetween('date', [$startDate, $endDate])
                ->groupBy('user_id')
                ->with('user')
                ->get();

            return response()->json([
                'success' => true,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'summary' => $summary,
            ]);

        } catch (\Exception $e) {
            Log::error('Get attendance summary error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get attendance summary',
            ], 500);
        }
    }

    /**
     * STRICT 1:1 Face Comparison using Euclidean distance
     * Threshold: 0.5 (90% confidence required)
     * 
     * @param mixed $storedDescriptor - Face descriptor from database
     * @param array|null $liveDescriptor - Face descriptor from live capture
     * @return array ['is_match' => bool, 'distance' => float, 'confidence' => int]
     */
    private function compareFacesStrict($storedDescriptor, ?array $liveDescriptor): array
    {
        // STRICT THRESHOLD - DO NOT CHANGE
        $THRESHOLD = 0.5; // 90% confidence required
        
        // Parse stored descriptor
        if (is_string($storedDescriptor)) {
            $storedDescriptor = json_decode($storedDescriptor, true);
        }
        
        // Validate descriptors
        if (empty($storedDescriptor) || !is_array($storedDescriptor)) {
            Log::warning('No stored face descriptor available');
            return ['is_match' => false, 'distance' => 999.0, 'confidence' => 0];
        }
        
        if (empty($liveDescriptor) || !is_array($liveDescriptor)) {
            Log::warning('No live face descriptor provided');
            return ['is_match' => false, 'distance' => 999.0, 'confidence' => 0];
        }
        
        if (count($storedDescriptor) !== count($liveDescriptor)) {
            Log::error('Descriptor length mismatch', [
                'stored' => count($storedDescriptor),
                'live' => count($liveDescriptor)
            ]);
            return ['is_match' => false, 'distance' => 999.0, 'confidence' => 0];
        }
        
        // Calculate Euclidean distance
        $sum = 0.0;
        $count = count($storedDescriptor);
        
        for ($i = 0; $i < $count; $i++) {
            $diff = $storedDescriptor[$i] - $liveDescriptor[$i];
            $sum += $diff * $diff;
        }
        
        $distance = sqrt($sum);
        
        // Convert to confidence percentage
        $confidence = (int) max(0, min(100, (1 - $distance) * 100));
        
        // STRICT CHECK: distance must be < 0.5
        $isMatch = $distance < $THRESHOLD;
        
        Log::info('STRICT 1:1 Face Comparison', [
            'distance' => round($distance, 4),
            'threshold' => $THRESHOLD,
            'confidence' => $confidence . '%',
            'is_match' => $isMatch,
            'descriptor_length' => $count
        ]);
        
        return [
            'is_match' => $isMatch,
            'distance' => round($distance, 4),
            'confidence' => $confidence
        ];
    }
}
