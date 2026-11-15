<?php

namespace Database\Seeders;

use App\Models\WheelItem;
use Illuminate\Database\Seeder;

class WheelItemSeeder extends Seeder
{
    public function run(): void
    {
        if (WheelItem::exists()) {
            return; // never duplicates or overwrites your own items
        }

        $items = [
            'date' => [
                'Watch a movie together online',
                'Cook the same recipe at the same time on a call',
                'Take a walk and share photos of what you see',
                'Play a game together for one hour',
                'Plan a dream trip, just for fun',
            ],
            'talk' => [
                'What is a small thing that made you smile this week?',
                'What is a memory of us you replay sometimes?',
                'Where would you love to wake up tomorrow?',
                'What is something you are looking forward to?',
                'What song feels like us right now?',
            ],
            'challenge' => [
                'Send a selfie with a silly face',
                'Write three things you like about the other person',
                'Draw each other in 60 seconds',
                'Share a song you have been replaying',
                'Tell a joke, the worse the better',
            ],
            'treat' => [
                'A virtual hug (30 seconds, no skipping)',
                'You pick the next movie',
                'A compliment from the other person',
                'A song dedicated to you',
                'A late-night voice message',
            ],
        ];

        foreach ($items as $category => $labels) {
            foreach ($labels as $label) {
                WheelItem::create(['category' => $category, 'label' => $label]);
            }
        }
    }
}