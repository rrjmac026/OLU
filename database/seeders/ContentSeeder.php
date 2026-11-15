<?php

namespace Database\Seeders;

use App\Models\ContentItem;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        if (ContentItem::count() > 0) {
            return;
        }

        $data = [
            'compliment' => [
                'You deserve all the happiness in the world.',
                'Your laugh makes ordinary days feel special.',
                'You are enough, exactly as you are today.',
                'Somebody out there is very proud of you.',
                'You make hard things look gentle.',
                'The world is a little brighter with you in it.',
            ],
            'question' => [
                "What's one small thing that made you smile this week?",
                'If we could teleport anywhere for a day, where would you pick?',
                "What's a song that always lifts your mood?",
                "What's something you're looking forward to?",
                "What's your favorite comfort food and why?",
                'What is a memory of us that you replay sometimes?',
            ],
            'comfort' => [
                'Hard days pass. You do not have to rush it.',
                'Take a slow breath. You are doing better than you think.',
                'It is okay to rest. Resting is not giving up.',
                'You are not alone, even when it feels that way.',
                'Be as kind to yourself as you would be to someone you love.',
            ],
        ];

        foreach ($data as $kind => $bodies) {
            foreach ($bodies as $body) {
                ContentItem::create(['kind' => $kind, 'body' => $body]);
            }
        }
    }
}