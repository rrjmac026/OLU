<?php

namespace Database\Seeders;

use App\Models\Puzzle;
use Illuminate\Database\Seeder;

class PuzzleSeeder extends Seeder
{
    public function run(): void
    {
        if (Puzzle::query()->exists()) {
            return;
        }

        $items = [
            ['I speak without a mouth and hear without ears. What am I?', 'echo|an echo', 'You can hear me in the mountains.'],
            ['What has hands but can\'t clap?', 'clock|a clock', 'It tells you something all day.'],
            ['The more you take, the more you leave behind. What am I?', 'footsteps|steps|footprints', 'Think about walking.'],
            ['What gets wetter the more it dries?', 'towel|a towel', 'It lives in the bathroom.'],
            ['What has a heart that doesn\'t beat?', 'artichoke|an artichoke', 'It\'s a vegetable.'],
            ['What can you catch but not throw?', 'cold|a cold', 'Achoo!'],
            ['What has keys but can\'t open locks?', 'piano|a piano|keyboard', 'Music comes out of it.'],
            ['What goes up but never comes down?', 'age|your age', 'It happens every birthday.'],
            ['I have cities but no houses, mountains but no trees, and water but no fish. What am I?', 'map|a map', 'Useful when you\'re lost.'],
            ['What has a neck but no head?', 'bottle|a bottle', 'You drink from it.'],
            ['What can travel around the world while staying in a corner?', 'stamp|a stamp', 'Look at an envelope.'],
            ['What begins with T, ends with T, and has T in it?', 'teapot|a teapot', 'Time for a warm drink.'],
            ['What month of the year has 28 days?', 'all of them|all|every month', 'Read the question carefully.'],
            ['The more of me there is, the less you see. What am I?', 'darkness|dark|the dark', 'Turn on a light.'],
        ];

        foreach ($items as [$question, $answer, $hint]) {
            Puzzle::create(compact('question', 'answer', 'hint'));
        }
    }
}