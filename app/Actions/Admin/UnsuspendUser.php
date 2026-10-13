<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Models\User;
use App\Support\HubAudit;

class UnsuspendUser
{
    /**
     * Unsuspend a suspended user and log the action.
     */
    public function handle(User $admin, User $target): void
    {
        $target->update(['suspended_at' => null]);

        HubAudit::record(
            HubEvent::UserUnsuspended,
            $target,
            $admin,
            ['email' => $target->email]
        );
    }
}
