<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UpdateUser
{
    /**
     * Update an existing user's details, password, and role.
     *
     * @param  array{name: string, email: string, password?: string|null}  $attributes
     */
    public function handle(User $admin, User $target, array $attributes, ?string $role = null): User
    {
        if ($target->is($admin) && $role !== null && $role !== 'admin') {
            throw ValidationException::withMessages([
                'role' => ['You cannot demote your own administrator account.'],
            ]);
        }

        if ($target->hasRole('admin') && $role !== null && $role !== 'admin' && User::role('admin')->count() <= 1) {
            throw ValidationException::withMessages([
                'role' => ['Cannot demote the sole administrator in the system.'],
            ]);
        }

        return DB::transaction(function () use ($admin, $target, $attributes, $role) {
            $target->name = $attributes['name'];
            $target->email = $attributes['email'];

            $passwordUpdated = ! empty($attributes['password']);
            if ($passwordUpdated) {
                $target->password = Hash::make($attributes['password']);
            }

            $target->save();

            if ($role !== null) {
                $target->syncRoles([$role]);
            }

            HubAudit::record(
                HubEvent::UserUpdated,
                $target,
                $admin,
                [
                    'email' => $target->email,
                    'role' => $role ?? $target->roles->first()?->name,
                    'password_updated' => $passwordUpdated,
                ]
            );

            return $target;
        });
    }
}
