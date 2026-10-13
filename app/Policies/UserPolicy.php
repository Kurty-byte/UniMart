<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('user.view_any');
    }

    /**
     * Determine whether the user can view the specific user.
     */
    public function view(User $user, User $target): bool
    {
        return $user->is($target) || $user->can('user.view');
    }

    /**
     * Determine whether the user can create users.
     */
    public function create(User $user): bool
    {
        return $user->can('user.create');
    }

    /**
     * Determine whether the user can update the specific user.
     */
    public function update(User $user, User $target): bool
    {
        return $user->is($target) || $user->can('user.update');
    }

    /**
     * Determine whether the user can delete the specific user.
     */
    public function delete(User $user, User $target): bool
    {
        return $user->can('user.delete');
    }

    /**
     * Determine whether the user can suspend the specific user.
     */
    public function suspend(User $user, User $target): bool
    {
        return $user->can('user.suspend');
    }

    /**
     * Determine whether the user can update permissions for the specific user.
     */
    public function updatePermissions(User $user, User $target): bool
    {
        return $user->can('user.permissions.update');
    }

    /**
     * Determine whether the user can view the target user's e-wallet QR code.
     */
    public function viewEwalletQr(User $viewer, User $owner): bool
    {
        return $viewer->is($owner) || $viewer->can('payout.process');
    }
}
