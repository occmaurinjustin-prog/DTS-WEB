<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterFaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,user_id'],
            'images' => ['required', 'array', 'size:10'],
            'images.*' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5120'], // max 5MB per image
        ];
    }
}
