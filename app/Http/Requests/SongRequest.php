<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SongRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'artist' => ['nullable', 'string', 'max:150'],
            // http/https only, so javascript: and similar links are rejected.
            'link' => ['nullable', 'url:http,https', 'max:500'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}