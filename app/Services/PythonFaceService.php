<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;

class PythonFaceService
{
    protected string $baseUrl;

    public function __construct()
    {
        // Defaulting to localhost:5000 if not in env
        $this->baseUrl = env('PYTHON_FACE_API_URL', 'http://127.0.0.1:5000');
    }

    /**
     * @param UploadedFile[] $images
     */
    public function registerFace(array $images)
    {
        $request = Http::asMultipart();
        
        foreach ($images as $key => $image) {
            $request->attach(
                'images[]',
                file_get_contents($image->getPathname()),
                $image->getClientOriginalName()
            );
        }

        $response = $request->post($this->baseUrl . '/register-face');
        
        return $response->json();
    }

    public function verifyFace(UploadedFile $selfie, string $encoding)
    {
        $response = Http::asMultipart()
            ->attach(
                'selfie_image',
                file_get_contents($selfie->getPathname()),
                $selfie->getClientOriginalName()
            )
            ->post($this->baseUrl . '/verify-face', [
                'encoding' => $encoding
            ]);

        return $response->json();
    }
}
