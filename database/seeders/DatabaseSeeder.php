<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@example.com')],
            [
                'name' => env('ADMIN_NAME', 'Admin'),
                'password' => env('ADMIN_PASSWORD', 'change-me-please'),
                'role' => Role::Admin,
                'is_active' => true,
            ],
        );

        $this->call([
            ContentSeeder::class,
            WheelItemSeeder::class,
        ]);
    }
}