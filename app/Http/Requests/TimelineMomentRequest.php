<?php

namespace App\Http\Requests;

use App\Enums\Visibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TimelineMomentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'story' => ['nullable', 'string', 'max:2000'],
            'moment_date' => ['required', 'date_format:Y-m-d'],
            'visibility' => ['required', Rule::enum(Visibility::class)],
        ];
    }
}