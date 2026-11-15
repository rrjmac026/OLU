<?php

namespace App\Http\Requests;

use App\Enums\LetterKind;
use App\Enums\LetterOccasion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LetterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:admin middleware + sender check live on the routes/controller
    }

    public function rules(): array
    {
        return [
            'kind' => ['required', Rule::enum(LetterKind::class)],
            'occasion' => [
                'nullable',
                'required_if:kind,' . LetterKind::OpenWhen->value,
                Rule::enum(LetterOccasion::class),
            ],
            'title' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:20000'],
            'unlock_at' => ['nullable', 'date_format:Y-m-d\TH:i'],
        ];
    }
}