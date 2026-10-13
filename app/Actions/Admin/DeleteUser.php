<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteUser
{
    /**
     * Delete an eligible user account with security and business safeguards.
     */
    public function handle(User $admin, User $target): void
    {
        if ($target->is($admin)) {
            throw ValidationException::withMessages([
                'user' => ['You cannot delete your own account.'],
            ]);
        }

        if ($target->hasRole('admin') && User::role('admin')->count() <= 1) {
            throw ValidationException::withMessages([
                'user' => ['Cannot delete the sole administrator in the system.'],
            ]);
        }

        if ($target->hasMarketplaceHistory()) {
            throw ValidationException::withMessages([
                'user' => ['Accounts with marketplace or hub activity cannot be deleted. Suspend the account instead.'],
            ]);
        }

        DB::transaction(function () use ($admin, $target) {
            HubAudit::record(
                HubEvent::UserDeleted,
                $target,
                $admin,
                [
                    'email' => $target->email,
                    'user_id' => $target->id,
                ]
            );

            $target->delete();
        });
    }
}
