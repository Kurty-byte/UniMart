<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(string $role = 'student'): void
    {
        Role::findOrCreate($role);

        User::factory(200)
            ->afterCreating(function (User $user) use ($role) {
                $user->assignRole($role);
            })
            ->create();
    }
}
