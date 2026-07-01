<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceRequest;
use App\Services\FaceRegistrationService;
use App\Services\AttendanceService;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class VerifyFaceController extends Controller
{
    protected FaceRegistrationService $faceService;
    protected AttendanceService $attendanceService;

    public function __construct(FaceRegistrationService $faceService, AttendanceService $attendanceService)
    {
        $this->faceService = $faceService;
        $this->attendanceService = $attendanceService;
    }

    /**
     * For Mobile Attendance
     */
    public function verifyAndLogAttendance(AttendanceRequest $request): JsonResponse
    {
        $user = User::findOrFail($request->user_id);
        $image = $request->file('image');

        if ($user->face_status !== 'Registered') {
            return response()->json(['success' => false, 'message' => 'User face is not registered'], 400);
        }

        $result = $this->faceService->verifyFace($user, $image);

        if ($result['success']) {
            $attendance = $this->attendanceService->logAttendance($user);
            return response()->json([
                'success' => true,
                'message' => 'Attendance logged successfully',
                'data' => $attendance
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message']
        ], 401);
    }
}
