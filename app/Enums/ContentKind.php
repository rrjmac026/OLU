<?php

namespace App\Enums;

enum ContentKind: string
{
    case Question = 'question';
    case Compliment = 'compliment';
    case Comfort = 'comfort';
    case Reason = 'reason';
}