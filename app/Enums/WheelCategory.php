<?php

namespace App\Enums;

enum WheelCategory: string
{
    case Date = 'date';
    case Talk = 'talk';
    case Challenge = 'challenge';
    case Treat = 'treat';
}