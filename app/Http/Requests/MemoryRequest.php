<?php

namespace App\Http\Requests;

use App\Enums\Visibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ownership is enforced in the controller (404 for non-owners)
    }

    public function rules(): array
    {
        return [
            'caption' => ['nullable', 'string', 'max:1000'],
            'taken_on' => ['nullable', 'date'],
            'visibility' => ['required', Rule::enum(Visibility::class)],
            'timeline_moment_id' => ['nullable', 'integer'],
            'photos' => ['nullable', 'array', 'max:6'],
            'photos.*' => ['file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'remove_photos' => ['nullable', 'array'],
            'remove_photos.*' => ['integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'photos.*.mimes' => 'Photos must be JPG, PNG or WebP.',
            'photos.*.max' => 'Each photo must be 8 MB or smaller.',
            'photos.max' => 'A memory can have up to 6 photos.',
        ];
    }
}