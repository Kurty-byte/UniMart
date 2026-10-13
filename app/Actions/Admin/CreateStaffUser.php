<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateStaffUser
{
    /**
     * Create a staff user and assign permissions.
     *
     * @param  array{name: string, email: string, password: string}  $attributes
     * @param  array<int, string>  $permissions
     */
    public function handle(User $admin, array $attributes, array $permissions = []): User
    {
        return DB::transaction(function () use ($admin, $attributes, $permissions) {
            $user = User::create([
                'name' => $attributes['name'],
                'email' => $attributes['email'],
                'password' => Hash::make($attributes['password']),
                'email_verified_at' => now(),
            ]);

            $user->assignRole('staff');

            if (! empty($permissions)) {
                $user->syncPermissions($permissions);
            }

            HubAudit::record(
                HubEvent::StaffAccountCreated,
                $user,
                $admin,
                [
                    'email' => $user->email,
                    'permissions' => $permissions,
                ]
            );

            return $user;
        });
    }
}
