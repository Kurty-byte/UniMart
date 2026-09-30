<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleAndPermissionSeeder::class);

        // Create Admin User
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@unimart.test',
        ]);
        $admin->assignRole('admin');

        // Create Staff User
        $staff = User::factory()->create([
            'name' => 'Staff Member',
            'email' => 'staff@unimart.test',
        ]);
        $staff->assignRole('staff');

        // Create Student User 1
        $student1 = User::factory()->create([
            'name' => 'Student User 1',
            'email' => 'student1@unimart.test',
        ]);
        $student1->assignRole('student');

        // Create Student User 2
        $student2 = User::factory()->create([
            'name' => 'Student User 2',
            'email' => 'student2@unimart.test',
        ]);
        $student2->assignRole('student');
    }
}
