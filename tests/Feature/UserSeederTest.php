<?php

use App\Models\User;
use Database\Seeders\UserSeeder;

it('seeds users with the default student role', function () {
    $this->seed(UserSeeder::class);

    expect(User::count())->toBe(200)
        ->and(User::role('student')->count())->toBe(200);
});

it('allows seeding users with a custom specified role', function () {
    $seeder = new UserSeeder;
    $seeder->run('staff');

    expect(User::count())->toBe(200)
        ->and(User::role('staff')->count())->toBe(200);
});
