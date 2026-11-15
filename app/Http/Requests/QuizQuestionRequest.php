<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuizQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:200'],
            'options' => ['required', 'array', 'min:2', 'max:4'],
            'options.*' => ['required', 'string', 'max:100', 'distinct'],
            'correct' => [
                'required', 'integer', 'min:0',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if ($value >= count($this->input('options', []))) {
                        $fail('Mark which option is the right one.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'options.min' => 'Add at least two options.',
            'options.*.distinct' => 'Each option should be different.',
        ];
    }
}