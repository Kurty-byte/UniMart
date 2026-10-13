<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Operational permissions directly grantable to desk staff members.
     *
     * @var array<int, string>
     */
    public const STAFF_OPERATIONAL_PERMISSIONS = [
        'item.dropoff.approve',
        'item.dropoff.reject',
        'item.return.retrieve',
        'order.claim.complete',
        'payout.process',
        'drawer_count.open',
        'drawer_count.close',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Staff Base & Operational Permissions
        $staffBasePermissions = [
            'portal.staff.access',
            'qr.scan',
        ];

        // 2. Student Permissions
        $studentPermissions = [
            'item.view_any',
            'item.view',
            'item.create',
            'item.update',
            'item.delete',
            'order.create',
            'order.cancel',
            'report.create',
        ];

        // 3. Admin-Only Management Permissions
        $adminPermissions = [
            'portal.admin.access',
            'user.view_any',
            'user.view',
            'user.create',
            'user.update',
            'user.delete',
            'user.suspend',
            'user.permissions.update',
            'category.create',
            'category.update',
            'category.delete',
            'item.takedown',
            'drawer_count.view_any',
            'drawer_count.audit',
            'report.view_any',
            'report.resolve',
            'setting.view_any',
            'setting.update',
            'payout.view_any',
            'payout.hold',
            'payout.release',
        ];

        $allPermissions = array_unique(array_merge(
            $staffBasePermissions,
            self::STAFF_OPERATIONAL_PERMISSIONS,
            $studentPermissions,
            $adminPermissions
        ));

        foreach ($allPermissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Roles and assign created permissions
        $staffRole = Role::findOrCreate('staff', 'web');
        $staffRole->syncPermissions($staffBasePermissions);

        $studentRole = Role::findOrCreate('student', 'web');
        $studentRole->syncPermissions($studentPermissions);

        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->syncPermissions(Permission::all());
    }
}
