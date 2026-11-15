<?php

namespace App\Enums;

enum Mood: string
{
    case Happy = 'happy';
    case Loved = 'loved';
    case Excited = 'excited';
    case Calm = 'calm';
    case Okay = 'okay';
    case Tired = 'tired';
    case Sad = 'sad';
    case Anxious = 'anxious';
    case Stressed = 'stressed';
}