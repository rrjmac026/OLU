<?php

namespace App\Http\Requests;

use App\Enums\EventType;
use App\Enums\Visibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'event_date' => ['required', 'date_format:Y-m-d'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'type' => ['required', Rule::enum(EventType::class)],
            'repeats_yearly' => ['boolean'],
            'visibility' => ['required', Rule::enum(Visibility::class)],
        ];
    }
}