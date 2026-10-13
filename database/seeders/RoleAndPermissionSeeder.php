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
            // Staff / Desk Permissions
            'access staff portal',
            'scan qr codes',
            'process dropoffs',
            'process claims',
            'process returns',
            'process payouts',
            'submit drawer counts',

            // Admin / Management Permissions
            'access admin portal',
            'manage hub',
            'manage inventory',
            'manage categories',
            'manage users',
            'manage finances',
            'audit shifts',

            // Student Permissions
            'create listings',
            'manage own listings',
            'browse catalog',
            'buy items',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Roles and assign created permissions
        $staffRole = Role::create(['name' => 'staff']);
        $staffRole->givePermissionTo(Permission::whereIn('name', [
            'access staff portal',
            'scan qr codes',
        ])->get());

        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $studentRole = Role::create(['name' => 'student']);
        $studentRole->givePermissionTo(Permission::whereIn('name', [
            'create listings',
            'manage own listings',
            'browse catalog',
            'buy items',
        ])->get());
    }
}
