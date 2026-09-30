<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'access admin portal',
            'manage hub',
            'create listings',
            'manage own listings',
            'browse catalog',
            'buy items',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Roles and assign created permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::whereIn('name', [
            'access admin portal',
            'manage hub',
        ])->get());

        $studentRole = Role::create(['name' => 'student']);
        $studentRole->givePermissionTo(Permission::whereIn('name', [
            'create listings',
            'manage own listings',
            'browse catalog',
            'buy items',
        ])->get());
    }
}
