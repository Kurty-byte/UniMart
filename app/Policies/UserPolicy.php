<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the target user's e-wallet QR code.
     */
    public function viewEwalletQr(User $viewer, User $owner): bool
    {
        return $viewer->is($owner) || $viewer->can('process payouts');
    }
}
