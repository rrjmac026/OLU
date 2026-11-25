<?php

namespace App\Enums;

enum ActivityAction: string
{
    case Login = 'login';
    case LoginFailed = 'login_failed';
    case Logout = 'logout';
    case Created = 'created';
    case Updated = 'updated';
    case Deleted = 'deleted';
    case Opened = 'opened';
    case Published = 'published';

    public function label(): string
    {
        return match ($this) {
            self::Login => 'Login',
            self::LoginFailed => 'Failed login',
            self::Logout => 'Logout',
            self::Created => 'Created',
            self::Updated => 'Updated',
            self::Deleted => 'Deleted',
            self::Opened => 'Opened',
            self::Published => 'Published',
        };
    }
}