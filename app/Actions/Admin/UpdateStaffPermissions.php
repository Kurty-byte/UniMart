<?php

namespace App\Actions\Admin;

use App\Enums\HubEvent;
use App\Models\User;
use App\Support\HubAudit;

class UpdateStaffPermissions
{
    /**
     * Update direct operational permissions for a staff member.
     *
     * @param  array<int, string>  $permissions
     */
    public function handle(User $admin, User $staff, array $permissions): void
    {
        $staff->syncPermissions($permissions);

        HubAudit::record(
            HubEvent::StaffPermissionsUpdated,
            $staff,
            $admin,
            [
                'permissions' => $permissions,
            ]
        );
    }
}
