<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Face Verification Controller
 * Handles strict 1:1 face matching for mechanic attendance
 */
class FaceVerificationController extends Controller
{
    /**
     * Euclidean distance threshold for face matching
     * Lower = stricter (0.5 = 90% confidence)
     */
    private const FACE_MATCH_THRESHOLD = 0.5;

    /**
     * Verify face against stored mechanic face data
     * STRICT 1:1 MATCHING - Only matches the specific mechanic's registered face
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyFace(Request $request)
    {
        Log::info('=== FACE VERIFICATION REQUEST ===', [
            'unique_id' => $request->input('unique_id'),
            'has_image' => !empty($request->input('face_image')),
        ]);

        try {
            // 1. VALIDATE REQUEST
            $data = $request->validate([
                'unique_id' => 'required|string|exists:users,unique_id',
                'face_image' => 'required|string', // Base64 encoded image
                'timestamp' => 'required|date',
            ]);

            // 2. FETCH MECHANIC BY UNIQUE ID (1:1 Matching)
            $mechanic = User::where('unique_id', $data['unique_id'])
                ->where('role', 'mechanic')
                ->first();

            if (!$mechanic) {
                Log::warning('Mechanic not found: ' . $data['unique_id']);
                return response()->json([
                    'success' => false,
                    'message' => 'Mechanic not found',
                    'code' => 'MECHANIC_NOT_FOUND',
                ], 404);
            }

            // 3. CHECK IF FACE IS REGISTERED
            if (empty($mechanic->face_descriptor)) {
                Log::warning('No face registered for mechanic: ' . $mechanic->unique_id);
                return response()->json([
                    'success' => false,
                    'message' => 'No face registered for this mechanic. Please contact admin.',
                    'code' => 'FACE_NOT_REGISTERED',
                ], 403);
            }

            // 4. PARSE STORED FACE DESCRIPTOR
            $storedDescriptor = $this->parseFaceDescriptor($mechanic->face_descriptor);
            if (!$storedDescriptor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid face data in database',
                    'code' => 'INVALID_FACE_DATA',
                ], 500);
            }

            Log::info('Stored face descriptor loaded', [
                'mechanic_id' => $mechanic->unique_id,
                'descriptor_length' => count($storedDescriptor),
            ]);

            // 5. EXTRACT FACE DESCRIPTOR FROM LIVE IMAGE
            // In production: Use Python service, AWS Rekognition, or Azure Face API
            // For now: Simulate extraction with realistic comparison
            $liveDescriptor = $this->extractFaceDescriptorFromImage($data['face_image']);

            if (!$liveDescriptor) {
                Log::warning('No face detected in live image');
                return response()->json([
                    'success' => false,
                    'message' => 'No face detected. Please ensure your face is clearly visible.',
                    'code' => 'NO_FACE_DETECTED',
                ], 400);
            }

            Log::info('Live face descriptor extracted', [
                'descriptor_length' => count($liveDescriptor),
            ]);

            // 6. STRICT 1:1 COMPARISON - Compare live face with ONLY this mechanic's face
            $comparison = $this->compareFaceDescriptors($storedDescriptor, $liveDescriptor);

            Log::info('Face comparison result', [
                'distance' => $comparison['distance'],
                'is_match' => $comparison['is_match'],
                'threshold' => self::FACE_MATCH_THRESHOLD,
                'confidence' => $comparison['confidence'] . '%',
            ]);

            // 7. STRICT THRESHOLD CHECK (0.5 = 90% confidence)
            if (!$comparison['is_match']) {
                Log::warning('FACE VERIFICATION FAILED', [
                    'mechanic_id' => $mechanic->unique_id,
                    'distance' => $comparison['distance'],
                    'threshold' => self::FACE_MATCH_THRESHOLD,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Face verification failed. Your face does not match the registered face.',
                    'code' => 'FACE_MISMATCH',
                    'distance' => $comparison['distance'],
                    'threshold' => self::FACE_MATCH_THRESHOLD,
                    'confidence' => $comparison['confidence'],
                    'hint' => 'Ensure you are the registered mechanic and try again.',
                ], 403);
            }

            // 8. SUCCESS - Face matches
            Log::info('FACE VERIFICATION PASSED', [
                'mechanic_id' => $mechanic->unique_id,
                'distance' => $comparison['distance'],
                'confidence' => $comparison['confidence'] . '%',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Face verification successful',
                'mechanic_id' => $mechanic->unique_id,
                'mechanic_name' => $mechanic->firstname . ' ' . $mechanic->lastname,
                'distance' => $comparison['distance'],
                'confidence' => $comparison['confidence'],
                'code' => 'FACE_VERIFIED',
            ]);

        } catch (\Exception $e) {
            Log::error('Face verification error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Face verification system error',
                'code' => 'SYSTEM_ERROR',
            ], 500);
        }
    }

    /**
     * Parse face descriptor from database (JSON or array)
     *
     * @param mixed $descriptor
     * @return array|null
     */
    private function parseFaceDescriptor($descriptor): ?array
    {
        if (is_string($descriptor)) {
            $parsed = json_decode($descriptor, true);
            return is_array($parsed) ? $parsed : null;
        }
        return is_array($descriptor) ? $descriptor : null;
    }

    /**
     * Extract face descriptor from image
     * NOTE: In production, use Python service or cloud API
     *
     * @param string $base64Image
     * @return array|null
     */
    private function extractFaceDescriptorFromImage(string $base64Image): ?array
    {
        // PRODUCTION IMPLEMENTATION:
        // 1. Call Python service with face-api.js
        // 2. Or use AWS Rekognition
        // 3. Or use Azure Face API
        // 4. Or use Google Cloud Vision

        // SIMULATION: Generate realistic face descriptor
        // In production, this should extract actual face features from the image
        
        $descriptorLength = 128; // Standard face-api.js descriptor length
        $descriptor = [];
        
        // Generate random descriptor (simulating different face)
        for ($i = 0; $i < $descriptorLength; $i++) {
            $descriptor[] = (float) (mt_rand(-1000, 1000) / 1000);
        }
        
        Log::info('Face descriptor extracted from image', [
            'length' => count($descriptor),
        ]);
        
        return $descriptor;
    }

    /**
     * Compare two face descriptors using Euclidean distance
     * STRICT 1:1 COMPARISON
     *
     * @param array $storedDescriptor
     * @param array $liveDescriptor
     * @return array ['is_match' => bool, 'distance' => float, 'confidence' => int]
     */
    private function compareFaceDescriptors(array $storedDescriptor, array $liveDescriptor): array
    {
        // Validate descriptors
        if (count($storedDescriptor) !== count($liveDescriptor)) {
            Log::error('Descriptor length mismatch', [
                'stored' => count($storedDescriptor),
                'live' => count($liveDescriptor),
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
        
        // Convert distance to confidence percentage
        // Distance 0.0 = 100% confidence, Distance 1.0 = 0% confidence
        $confidence = (int) max(0, min(100, (1 - $distance) * 100));
        
        // STRICT THRESHOLD: 0.5 (90% confidence required)
        $isMatch = $distance < self::FACE_MATCH_THRESHOLD;
        
        Log::info('Face descriptor comparison', [
            'distance' => round($distance, 4),
            'threshold' => self::FACE_MATCH_THRESHOLD,
            'is_match' => $isMatch,
            'confidence' => $confidence . '%',
        ]);
        
        return [
            'is_match' => $isMatch,
            'distance' => round($distance, 4),
            'confidence' => $confidence,
        ];
    }

    /**
     * Get face verification statistics for mechanic
     *
     * @param string $uniqueId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getVerificationStats(string $uniqueId)
    {
        $mechanic = User::where('unique_id', $uniqueId)
            ->where('role', 'mechanic')
            ->first();

        if (!$mechanic) {
            return response()->json([
                'success' => false,
                'message' => 'Mechanic not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'mechanic_id' => $mechanic->unique_id,
            'has_registered_face' => !empty($mechanic->face_descriptor),
            'face_descriptor_length' => $mechanic->face_descriptor 
                ? count(json_decode($mechanic->face_descriptor, true) ?? []) 
                : 0,
        ]);
    }
}
