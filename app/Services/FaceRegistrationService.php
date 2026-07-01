<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;

class FaceRegistrationService
{
    protected string $flaskApiUrl;

    public function __construct()
    {
        $this->flaskApiUrl = env('PYTHON_API_URL', 'http://127.0.0.1:5000');
    }

    /**
     * Register a user's face to the Flask API.
     */
    public function registerFace(User $user, array $images): bool
    {
        try {
            $request = Http::asMultipart()->timeout(60);

            // Attach user_id
            $request->attach('user_id', $user->user_id);

            // Attach each image
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    $request->attach(
                        'images[]',
                        file_get_contents($image->getRealPath()),
                        $image->getClientOriginalName()
                    );
                }
            }

            $response = $request->post($this->flaskApiUrl . '/api/register-face');

            if ($response->successful()) {
                $user->update([
                    'face_status' => 'Registered',
                ]);
                return true;
            }

            Log::error('Face Registration Failed: ' . $response->body());
            return false;

        } catch (Exception $e) {
            Log::error('Face Registration Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Verify a user's face with the Flask API.
     */
    public function verifyFace(User $user, UploadedFile $image): array
    {
        try {
            $response = Http::asMultipart()->timeout(30)
                ->attach('user_id', $user->user_id)
                ->attach(
                    'image',
                    file_get_contents($image->getRealPath()),
                    $image->getClientOriginalName()
                )
                ->post($this->flaskApiUrl . '/api/verify-face');

            if ($response->successful()) {
                return ['success' => true, 'message' => 'Face matched successfully'];
            }

            $data = $response->json();
            return ['success' => false, 'message' => $data['message'] ?? 'Verification failed'];

        } catch (Exception $e) {
            Log::error('Face Verification Exception: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to connect to Face API'];
        }
    }
}
