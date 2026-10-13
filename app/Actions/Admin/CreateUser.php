<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateUser
{
    /**
     * Create a user with specified credentials and role.
     *
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function handle(User $admin, array $attributes, string $role = 'student'): User
    {
        return DB::transaction(function () use ($admin, $attributes, $role) {
            $user = User::create([
                'name' => $attributes['name'],
                'email' => $attributes['email'],
                'password' => Hash::make($attributes['password']),
                'email_verified_at' => now(),
            ]);

            $user->assignRole($role);

            HubAudit::record(
                HubEvent::UserCreated,
                $user,
                $admin,
                [
                    'email' => $user->email,
                    'role' => $role,
                ]
            );

            return $user;
        });
    }
}
