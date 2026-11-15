<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'theme' => ['sometimes', 'required', Rule::in(['light', 'dark', 'system'])],
            'notifications_enabled' => ['sometimes', 'boolean'],
            'notification_previews' => ['sometimes', 'boolean'],
            'gamification_enabled' => ['sometimes', 'boolean'],
        ];
    }
}