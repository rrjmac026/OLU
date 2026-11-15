<?php

namespace App\Http\Requests;

use App\Enums\WheelCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WheelItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:admin middleware is on the routes
    }

    public function rules(): array
    {
        return [
            'category' => ['required', Rule::enum(WheelCategory::class)],
            'label' => ['required', 'string', 'max:150'],
        ];
    }
}