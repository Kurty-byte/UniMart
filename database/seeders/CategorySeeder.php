<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Note: Replace with the university's official list of colleges and academic programs.
     */
    public function run(): void
    {
        $structure = [
            'General' => [
                'Physical Education',
                'Uniforms',
                'Textbooks',
                'School Supplies',
            ],
            'College of Engineering' => [
                'BS Civil Engineering',
                'BS Computer Engineering',
                'BS Electrical Engineering',
                'BS Mechanical Engineering',
            ],
            'College of Nursing' => [
                'BS Nursing',
            ],
            'College of Computer Studies' => [
                'BS Computer Science',
                'BS Information Technology',
                'BS Information Systems',
            ],
            'College of Business Administration' => [
                'BS Accountancy',
                'BS Business Administration',
                'BS Hospitality Management',
            ],
            'College of Arts and Sciences' => [
                'BA Communication',
                'BS Psychology',
                'BS Biology',
            ],
        ];

        foreach ($structure as $rootName => $children) {
            $root = Category::firstOrCreate([
                'name' => $rootName,
                'parent_id' => null,
            ]);

            foreach ($children as $childName) {
                Category::firstOrCreate([
                    'name' => $childName,
                    'parent_id' => $root->id,
                ]);
            }
        }
    }
}
