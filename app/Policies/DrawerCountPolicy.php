<?php

namespace App\Policies;

use App\Models\DrawerCount;
use App\Models\User;

class DrawerCountPolicy
{
    /**
     * Determine whether the user can view any drawer counts.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('drawer_count.view_any');
    }

    /**
     * Determine whether the user can open a drawer count shift.
     */
    public function open(User $user): bool
    {
        return $user->can('drawer_count.open');
    }

    /**
     * Determine whether the user can close a drawer count shift.
     */
    public function close(User $user, ?DrawerCount $drawerCount = null): bool
    {
        if (! $user->can('drawer_count.close')) {
            return false;
        }

        if ($drawerCount !== null && $drawerCount->staff_id !== null) {
            return $drawerCount->staff_id === $user->id || $user->hasRole('admin');
        }

        return true;
    }

    /**
     * Determine whether the user can audit drawer counts.
     */
    public function audit(User $user): bool
    {
        return $user->can('drawer_count.audit');
    }
}
