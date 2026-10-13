<?php

namespace Database\Seeders;

use App\Enums\HubEvent;
use App\Enums\ItemCondition;
use App\Enums\ItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Enums\ReportStatus;
use App\Enums\SettingKey;
use App\Models\Category;
use App\Models\DrawerCount;
use App\Models\Item;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use App\Support\HubAudit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoMarketplaceSeeder extends Seeder
{
    /**
     * Run the comprehensive demo marketplace seeds.
     */
    public function run(): void
    {
        // 1. Settings
        foreach (SettingKey::cases() as $key) {
            Setting::firstOrCreate(
                ['key' => $key->value],
                ['value' => (string) $key->default()]
            );
        }

        // 2. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@unimart.test'],
            [
                'name' => 'Campus Admin',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->syncRoles(['admin']);

        $staff = User::firstOrCreate(
            ['email' => 'staff@unimart.test'],
            [
                'name' => 'Campus Hub Staff',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $staff->syncRoles(['staff']);
        $staff->givePermissionTo(RoleAndPermissionSeeder::STAFF_OPERATIONAL_PERMISSIONS);

        $student1 = User::firstOrCreate(
            ['email' => 'student1@unimart.test'],
            [
                'name' => 'Maria Santos',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'ewallet_qr_code' => 'ewallet/maria-gcash.png',
            ]
        );
        $student1->syncRoles(['student']);

        $student2 = User::firstOrCreate(
            ['email' => 'student2@unimart.test'],
            [
                'name' => 'Juan Dela Cruz',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'ewallet_qr_code' => 'ewallet/juan-maya.png',
            ]
        );
        $student2->syncRoles(['student']);

        $student3 = User::firstOrCreate(
            ['email' => 'student3@unimart.test'],
            [
                'name' => 'Alyssa Valdez',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'ewallet_qr_code' => 'ewallet/alyssa-gcash.png',
            ]
        );
        $student3->syncRoles(['student']);

        // 3. Categories
        $catNursing = Category::where('name', 'BS Nursing')->first() ?? Category::first();
        $catCivil = Category::where('name', 'BS Civil Engineering')->first() ?? Category::first();
        $catCS = Category::where('name', 'BS Computer Science')->first() ?? Category::first();
        $catUniforms = Category::where('name', 'Uniforms')->first() ?? Category::first();
        $catPE = Category::where('name', 'Physical Education')->first() ?? Category::first();

        // 4. Diverse Items

        // Item 1: Available on shelf (Nursing Scrubs)
        $item1 = Item::firstOrCreate(
            ['title' => 'BS Nursing Clinical Scrub Suit (Medium)'],
            [
                'seller_id' => $student1->id,
                'category_id' => $catNursing->id,
                'description' => 'Official university nursing clinical scrub suit in medium. Clean and sanitized.',
                'condition' => ItemCondition::LikeNew,
                'price' => '450.00',
                'quantity' => 2,
                'status' => ItemStatus::Available,
                'shelf_location' => 'Shelf-NUR01',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(5),
                'images' => ['items/scrub-suit.jpg'],
            ]
        );

        // Item 2: Available on shelf (Engineering Calculator)
        $item2 = Item::firstOrCreate(
            ['title' => 'Casio Scientific Calculator FX-991ES Plus'],
            [
                'seller_id' => $student2->id,
                'category_id' => $catCivil->id,
                'description' => 'Allowed in board exams. All solar cells and buttons functioning perfectly.',
                'condition' => ItemCondition::Used,
                'price' => '850.00',
                'quantity' => 1,
                'status' => ItemStatus::Available,
                'shelf_location' => 'Shelf-ENG04',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(3),
                'images' => ['items/calc.jpg'],
            ]
        );

        // Item 3: Available on shelf (CS Textbook)
        $item3 = Item::firstOrCreate(
            ['title' => 'Data Structures & Algorithms in Java (4th Ed)'],
            [
                'seller_id' => $student3->id,
                'category_id' => $catCS->id,
                'description' => 'Standard reference book for CS201. Crisp pages with slight pencil markings.',
                'condition' => ItemCondition::Used,
                'price' => '350.00',
                'quantity' => 1,
                'status' => ItemStatus::Available,
                'shelf_location' => 'Shelf-CS02',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(1),
                'images' => ['items/dsa-book.jpg'],
            ]
        );

        // Item 4: Available on shelf (PE Uniform)
        $item4 = Item::firstOrCreate(
            ['title' => 'University PE Jogging Pants (Size L)'],
            [
                'seller_id' => $student1->id,
                'category_id' => $catPE->id,
                'description' => 'Standard unisex athletic pants with campus emblem. Elastic waistband intact.',
                'condition' => ItemCondition::New,
                'price' => '300.00',
                'quantity' => 3,
                'status' => ItemStatus::Available,
                'shelf_location' => 'Shelf-PE01',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(2),
                'images' => ['items/pe-pants.jpg'],
            ]
        );

        // Item 5: Pending Drop-off (Digital Multimeter)
        Item::firstOrCreate(
            ['title' => 'Digital Multimeter with Test Probes'],
            [
                'seller_id' => $student2->id,
                'category_id' => $catCivil->id,
                'description' => 'Compact multimeter with 9V battery included. Awaiting drop-off at hub.',
                'condition' => ItemCondition::LikeNew,
                'price' => '500.00',
                'quantity' => 1,
                'status' => ItemStatus::PendingDropoff,
                'shelf_location' => null,
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => null,
                'images' => ['items/multimeter.jpg'],
            ]
        );

        // Item 6: In active Soft Hold (Cart reservation)
        $item6 = Item::firstOrCreate(
            ['title' => 'Medical-Surgical Nursing Handbook'],
            [
                'seller_id' => $student3->id,
                'category_id' => $catNursing->id,
                'description' => 'Clinical pocket guide with quick drug calculation tables.',
                'condition' => ItemCondition::Used,
                'price' => '280.00',
                'quantity' => 0,
                'status' => ItemStatus::Available,
                'shelf_location' => 'Shelf-NUR03',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(4),
                'images' => ['items/med-handbook.jpg'],
            ]
        );

        // Create active cart for Maria ($student1) holding Item 6
        $cartOrder = Order::firstOrCreate(
            [
                'buyer_id' => $student1->id,
                'status' => OrderStatus::Cart,
            ],
            [
                'total_price' => '280.00',
                'expires_at' => now()->addMinutes(12),
            ]
        );
        OrderItem::firstOrCreate(
            [
                'order_id' => $cartOrder->id,
                'item_id' => $item6->id,
            ],
            [
                'quantity' => 1,
                'price' => '280.00',
                'payout_status' => PayoutStatus::Pending,
            ]
        );

        // Item 7: Hard Hold / Pending Handover (Claim QR generated)
        $item7 = Item::firstOrCreate(
            ['title' => 'Discrete Mathematics and Its Applications'],
            [
                'seller_id' => $student1->id,
                'category_id' => $catCS->id,
                'description' => 'Rosen 7th edition, complete exercises and solutions guide.',
                'condition' => ItemCondition::Used,
                'price' => '400.00',
                'quantity' => 0,
                'status' => ItemStatus::Available,
                'shelf_location' => 'Shelf-CS05',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(6),
                'images' => ['items/discrete-math.jpg'],
            ]
        );

        // Pending Handover Order for Juan ($student2)
        $claimOrder = Order::firstOrCreate(
            [
                'buyer_id' => $student2->id,
                'status' => OrderStatus::PendingHandover,
            ],
            [
                'total_price' => '400.00',
                'claim_qr_code' => (string) Str::ulid(),
                'expires_at' => now()->addHours(18),
            ]
        );
        OrderItem::firstOrCreate(
            [
                'order_id' => $claimOrder->id,
                'item_id' => $item7->id,
            ],
            [
                'quantity' => 1,
                'price' => '400.00',
                'payout_status' => PayoutStatus::Pending,
            ]
        );

        // Item 8: Sold & Completed, Paid Digitally
        $item8 = Item::firstOrCreate(
            ['title' => 'University College Blazer (Size M)'],
            [
                'seller_id' => $student2->id,
                'category_id' => $catUniforms->id,
                'description' => 'Official college formal blazer with gold buttons.',
                'condition' => ItemCondition::LikeNew,
                'price' => '650.00',
                'quantity' => 0,
                'status' => ItemStatus::Sold,
                'shelf_location' => 'Shelf-UNI02',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(10),
                'images' => ['items/blazer.jpg'],
            ]
        );

        $completedOrder1 = Order::firstOrCreate(
            [
                'buyer_id' => $student3->id,
                'status' => OrderStatus::Completed,
            ],
            [
                'handled_by' => $staff->id,
                'total_price' => '650.00',
                'completed_at' => now()->subDays(1),
            ]
        );
        $orderItem8 = OrderItem::firstOrCreate(
            [
                'order_id' => $completedOrder1->id,
                'item_id' => $item8->id,
            ],
            [
                'quantity' => 1,
                'price' => '650.00',
                'payout_status' => PayoutStatus::PaidDigitally,
                'paid_by' => $staff->id,
                'paid_at' => now()->subDays(1),
            ]
        );

        // Item 9: Sold & Completed, Cash Held for Payout
        $item9 = Item::firstOrCreate(
            ['title' => 'Drafting Board & 36-inch T-Square'],
            [
                'seller_id' => $student3->id,
                'category_id' => $catCivil->id,
                'description' => 'Smooth magnetic drafting board with carry bag and drafting tape.',
                'condition' => ItemCondition::Used,
                'price' => '550.00',
                'quantity' => 0,
                'status' => ItemStatus::Sold,
                'shelf_location' => 'Shelf-ENG01',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(8),
                'images' => ['items/drafting-board.jpg'],
            ]
        );

        $completedOrder2 = Order::firstOrCreate(
            [
                'buyer_id' => $student1->id,
                'status' => OrderStatus::Completed,
            ],
            [
                'handled_by' => $staff->id,
                'total_price' => '550.00',
                'completed_at' => now()->subHours(2),
            ]
        );
        OrderItem::firstOrCreate(
            [
                'order_id' => $completedOrder2->id,
                'item_id' => $item9->id,
            ],
            [
                'quantity' => 1,
                'price' => '550.00',
                'payout_status' => PayoutStatus::CashHeld,
                'paid_by' => $staff->id,
                'paid_at' => null,
            ]
        );

        // Item 10: Expired Shelf Item (Awaiting Retrieval)
        Item::firstOrCreate(
            ['title' => 'Organic Chemistry Safety Splash Goggles'],
            [
                'seller_id' => $student1->id,
                'category_id' => $catUniforms->id,
                'description' => 'Anti-fog chemical splash safety goggles.',
                'condition' => ItemCondition::Used,
                'price' => '120.00',
                'quantity' => 1,
                'status' => ItemStatus::Expired,
                'shelf_location' => 'Shelf-RET01',
                'dropoff_qr_code' => (string) Str::ulid(),
                'dropped_off_at' => now()->subDays(35),
                'images' => ['items/goggles.jpg'],
            ]
        );

        // 5. Drawer Counts & Shifts
        // Historical shift
        DrawerCount::firstOrCreate(
            [
                'staff_id' => $staff->id,
                'shift_started_at' => now()->subDays(1)->setTime(8, 0),
            ],
            [
                'opening_cash' => '1000.00',
                'expected_cash' => '1650.00',
                'actual_cash' => '1650.00',
                'shift_ended_at' => now()->subDays(1)->setTime(17, 0),
                'notes' => 'All sales and digital payouts reconciled cleanly.',
            ]
        );

        // Current active open shift
        DrawerCount::firstOrCreate(
            [
                'staff_id' => $staff->id,
                'shift_started_at' => now()->setTime(8, 0),
                'shift_ended_at' => null,
            ],
            [
                'opening_cash' => '1000.00',
                'expected_cash' => null,
                'actual_cash' => null,
                'notes' => null,
            ]
        );

        // 6. In-App Messaging
        Message::firstOrCreate(
            [
                'sender_id' => $student2->id,
                'receiver_id' => $student1->id,
                'item_id' => $item1->id,
                'content' => 'Hi Maria! Is the scrub suit true to size or a bit loose?',
            ],
            [
                'read_at' => now()->subHours(4),
                'created_at' => now()->subHours(5),
            ]
        );

        Message::firstOrCreate(
            [
                'sender_id' => $student1->id,
                'receiver_id' => $student2->id,
                'item_id' => $item1->id,
                'content' => "Hello Juan! It's standard medium, fits really comfortably over clothes.",
            ],
            [
                'read_at' => null,
                'created_at' => now()->subHours(4),
            ]
        );

        // 7. Reports
        Report::firstOrCreate(
            [
                'reporter_id' => $student3->id,
                'item_id' => $item2->id,
            ],
            [
                'reported_user_id' => $student2->id,
                'reason' => 'Listed condition says good condition, but I wanted to verify if it has any screen scratches.',
                'status' => ReportStatus::Pending,
            ]
        );

        // 8. Hub Activity Logs
        HubAudit::record(HubEvent::DropoffApproved, $item1, $staff, ['shelf_location' => 'Shelf-NUR01']);
        HubAudit::record(HubEvent::DropoffApproved, $item2, $staff, ['shelf_location' => 'Shelf-ENG04']);
        HubAudit::record(HubEvent::ClaimCompleted, $completedOrder1, $staff, ['total_price' => '650.00']);
        HubAudit::record(HubEvent::PayoutDisbursedDigitally, $orderItem8, $staff);
    }
}
