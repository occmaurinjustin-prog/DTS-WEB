<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,user_id'],
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5120'],
            // Add gps data or location if needed
        ];
    }
}
