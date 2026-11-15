<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'display_name' => ['sometimes', 'required', 'string', 'max:60'],
            'nickname' => ['nullable', 'string', 'max:40'],
            'birthday' => ['nullable', 'date', 'before:today'],
            'bio' => ['nullable', 'string', 'max:500'],
            'timezone' => ['sometimes', 'required', 'timezone'],
        ];
    }
}