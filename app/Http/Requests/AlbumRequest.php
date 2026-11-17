<?php

namespace App\Http\Requests;

use App\Models\Album;
use App\Models\MemoryPhoto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class AlbumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:admin middleware guards the route
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:300'],
            'theme' => ['required', Rule::in(Album::THEMES)],
            'default_song_id' => ['nullable', 'integer', 'exists:songs,id'],
            'default_song_start' => ['nullable', 'numeric', 'min:0'],
            'default_song_end' => ['nullable', 'numeric', 'min:0'],

            'slides' => ['required', 'array', 'min:1', 'max:30'],
            'slides.*.memory_photo_id' => ['required', 'integer', 'exists:memory_photos,id'],
            'slides.*.caption' => ['nullable', 'string', 'max:200'],
            'slides.*.duration' => ['required', 'integer', 'between:2,15'],
            'slides.*.caption_position' => ['required', Rule::in(Album::POSITIONS)],
            'slides.*.filter' => ['required', Rule::in(Album::FILTERS)],
            'slides.*.transition' => ['required', Rule::in(Album::TRANSITIONS)],
            'slides.*.song_id' => ['nullable', 'integer', 'exists:songs,id'],
            'slides.*.song_start' => ['nullable', 'numeric', 'min:0'],
            'slides.*.song_end' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function after(): array
    {
        return [
            // A clip has to end after it starts.
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $bad = fn ($s, $e) => $s !== null && $e !== null && (float) $e <= (float) $s;

                if ($bad($this->input('default_song_start'), $this->input('default_song_end'))) {
                    $validator->errors()->add('default_song_end', 'The album song clip must end after it starts.');
                }

                foreach ($this->input('slides', []) as $i => $s) {
                    if ($bad($s['song_start'] ?? null, $s['song_end'] ?? null)) {
                        $validator->errors()->add("slides.$i.song_end", 'A slide song clip must end after it starts.');
                    }
                }
            },

            // Every photo must belong to a memory the admin can actually see.
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $ids = collect($this->input('slides', []))->pluck('memory_photo_id')->unique();

                $allowed = MemoryPhoto::whereIn('id', $ids)
                    ->whereHas('memory', fn ($q) => $q->visibleTo($this->user()))
                    ->count();

                if ($allowed !== $ids->count()) {
                    $validator->errors()->add('slides', 'One of the selected photos is not available.');
                }
            },
        ];
    }
}