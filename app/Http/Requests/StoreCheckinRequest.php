<?php

namespace App\Http\Requests;

use App\Enums\Mood;
use App\Enums\Visibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mood' => ['required', Rule::enum(Mood::class)],
            'note' => ['nullable', 'string', 'max:500'],
            'visibility' => ['sometimes', Rule::enum(Visibility::class)],
        ];
    }
}