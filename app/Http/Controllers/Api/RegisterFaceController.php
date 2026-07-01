<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterFaceRequest;
use App\Services\FaceRegistrationService;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class RegisterFaceController extends Controller
{
    protected FaceRegistrationService $faceService;

    public function __construct(FaceRegistrationService $faceService)
    {
        $this->faceService = $faceService;
    }

    public function register(RegisterFaceRequest $request): JsonResponse
    {
        $user = User::findOrFail($request->user_id);
        $images = $request->file('images');

        $success = $this->faceService->registerFace($user, $images);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Face registered successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to register face with Face API'
        ], 500);
    }
}
