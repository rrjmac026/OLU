<?php

namespace App\Http\Requests;

use App\Enums\JournalType;
use App\Enums\Visibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJournalEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(JournalType::class)],
            'title' => ['nullable', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:20000'],
            'entry_date' => ['required', 'date'],
            'visibility' => ['sometimes', Rule::enum(Visibility::class)],
        ];
    }
}