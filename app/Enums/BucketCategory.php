<?php

namespace App\Enums;

enum BucketCategory: string
{
    case Travel = 'travel';
    case Food = 'food';
    case Experience = 'experience';
    case Goal = 'goal';
    case Other = 'other';
}