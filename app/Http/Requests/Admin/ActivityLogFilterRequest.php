<?php

namespace App\Http\Requests\Admin;

use App\Enums\ActivityAction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActivityLogFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route is behind role:admin
    }

    public function rules(): array
    {
        return [
            'action' => ['nullable', Rule::enum(ActivityAction::class)],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'search' => ['nullable', 'string', 'max:100'],
        ];
    }
}