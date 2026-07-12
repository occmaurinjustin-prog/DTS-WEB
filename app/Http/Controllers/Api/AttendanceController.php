<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\AttendanceLog;
use App\Models\User;
use App\Services\AttendanceCalculationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    protected AttendanceCalculationService $calcService;

    public function __construct(AttendanceCalculationService $calcService)
    {
        $this->calcService = $calcService;
    }

    public function scan(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'image' => 'required|image',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'address' => 'nullable|string',
            'device_name' => 'nullable|string',
        ]);

        $user = User::findOrFail($request->user_id);
        
        // 1. Verify face using Python API
        try {
            $flaskApiUrl = env('PYTHON_API_URL', 'http://127.0.0.1:5000');
            $image = $request->file('image');
            
            $response = Http::asMultipart()->timeout(30)
                ->attach('user_id', $user->user_id)
                ->attach('image', file_get_contents($image->getRealPath()), $image->getClientOriginalName())
                ->post($flaskApiUrl . '/api/verify-face');

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Face verification failed'
                ], 401);
            }
            
            // Assume success if we get here. Python API doesn't return confidence yet, we default to 100
            $faceConfidence = 100.00; 
            
        } catch (\Exception $e) {
            Log::error('Face API Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Face API is offline'], 500);
        }

        // 2. Face verified, process attendance
        $now = Carbon::now();
        $date = $now->format('Y-m-d');
        $time = $now->format('H:i:s');
        
        $attendance = Attendance::firstOrCreate(
            ['user_id' => $user->user_id, 'attendance_date' => $date],
            ['status' => 'Absent']
        );

        $attendanceType = $this->calcService->determineAttendanceType($attendance, $now);

        if ($attendanceType === 'unknown') {
            return response()->json(['success' => false, 'message' => 'No valid attendance slot available at this time'], 400);
        }

        // Update the specific column based on type
        $attendance->{$attendanceType} = $time;
        
        // 3. Save attendance log
        $photoPath = $request->file('image')->store('attendance_logs', 'public');
        
        AttendanceLog::create([
            'attendance_id' => $attendance->id,
            'user_id' => $user->user_id,
            'attendance_type' => $attendanceType,
            'captured_at' => $now,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address,
            'face_confidence' => $faceConfidence,
            'device_name' => $request->device_name,
            'ip_address' => $request->ip(),
            'photo_path' => $photoPath,
        ]);

        $attendance->save();

        // 4. Recalculate
        $this->calcService->recalculate($attendance);
        
        $statusMsg = 'Attendance logged successfully for ' . str_replace('_', ' ', $attendanceType);

        return response()->json([
            'success' => true,
            'message' => $statusMsg,
            'data' => [
                'attendance_type' => $attendanceType,
                'attendance' => $attendance
            ]
        ]);
    }

    public function today(Request $request)
    {
        $user_id = $request->query('user_id');
        $date = Carbon::now()->format('Y-m-d');
        
        $attendance = Attendance::where('user_id', $user_id)->where('attendance_date', $date)->first();
        
        return response()->json(['success' => true, 'data' => $attendance]);
    }

    public function history(Request $request)
    {
        $user_id = $request->query('user_id');
        $attendances = Attendance::where('user_id', $user_id)->orderBy('attendance_date', 'desc')->get();
        return response()->json(['success' => true, 'data' => $attendances]);
    }
}
