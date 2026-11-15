<?php

namespace App\Http\Requests;

use App\Enums\BucketCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BucketItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'category' => ['required', Rule::enum(BucketCategory::class)],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}