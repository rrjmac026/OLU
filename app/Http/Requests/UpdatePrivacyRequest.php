<?php

namespace App\Http\Requests;

use App\Enums\Visibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePrivacyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'share_usage_summary' => ['sometimes', 'boolean'],
            'default_entry_visibility' => ['sometimes', Rule::enum(Visibility::class)],
        ];
    }
}