<?php

namespace App\Enums;

enum EventType: string
{
    case Anniversary = 'anniversary';
    case Birthday = 'birthday';
    case DatePlan = 'date_plan';
    case Reminder = 'reminder';
    case Other = 'other';
}