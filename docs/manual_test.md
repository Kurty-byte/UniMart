# UniMart — End-to-End Manual Testing Sequence (Single Admin Bootstrap)

This guide walks through testing the entire **UniMart** lifecycle from a clean database containing **only one Admin account**.

Because the `admin` role is granted both **Management** (`/admin/*`) and **Counter Operations** (`/staff/*`) permissions, that single Admin account can configure the platform, provision student test accounts, and operate the physical Campus Hub desk without needing a separate Staff login.

---

## 0. Prerequisites & Single-Admin Bootstrap

### 1. Reset Database & Seed Roles Only
Run a fresh migration and seed only the roles and permissions (skipping `DemoMarketplaceSeeder` and `UserSeeder`):

```bash
./vendor/bin/sail artisan migrate:fresh
./vendor/bin/sail artisan db:seed --class=RoleAndPermissionSeeder
```

*(Optional)* If you want the default university college/program categories pre-populated instead of creating all of them manually in Phase 1, run:

```bash
./vendor/bin/sail artisan db:seed --class=CategorySeeder
```

### 2. Create the Single Admin Account
Create the sole Admin user via Tinker (Admin accounts are automatically marked as verified and bypass email verification):

```bash
./vendor/bin/sail artisan tinker --execute '
$admin = \App\Models\User::create([
    "name" => "Campus Admin",
    "email" => "admin@unimart.test",
    "password" => bcrypt("password"),
    "email_verified_at" => now(),
]);
$admin->assignRole("admin");
'
```

### 3. Recommended Browser Setup
To avoid logging in and out repeatedly:
- **Browser Window 1 (Normal)**: Logged in as **Campus Admin** (`admin@unimart.test` / `password`) — acts as both System Administrator and Campus Hub Counter Operator.
- **Browser Window 2 (Incognito / Private)**: Used to log in as **Student A (Seller)** and **Student B (Buyer)**.

---

## Phase 1: System Configuration & Account Provisioning (Admin)

1. **Log in as Admin**:
   - In **Window 1**, open `/login` and sign in with `admin@unimart.test` / `password`.
   - Confirm you land on `/dashboard` and see three sidebar groups: **Overview**, **Counter Operations**, and **Management**.
2. **Create Categories (`/admin/categories`)**:
   - Navigate to **Management → Categories** (`/admin/categories`).
   - Create a root category:
     - **Name**: `General`
     - **Parent Category**: *None (Root)*
   - Create a sub-category:
     - **Name**: `Physical Education`
     - **Parent Category**: `General`
3. **Verify System Timers (`/admin/settings`)**:
   - Navigate to **Management → System Timers** (`/admin/settings`).
   - Confirm the default durations:
     - **Cart Soft Hold (Minutes)**: `15`
     - **Order Hard Hold (Hours)**: `24`
     - **Item Shelf Expiry (Days)**: `30`
   - Click **Save Settings** to confirm runtime persistence.
4. **Provision Student Accounts (`/admin/users`)**:
   - Navigate to **Management → Users** (`/admin/users`).
   - Click **Add User** and create **Student A (Seller)**:
     - **Name**: `Maria Seller`
     - **Email**: `seller@unimart.test`
     - **Password / Confirm**: `password`
     - **Role**: `student`
   - Click **Add User** again and create **Student B (Buyer)**:
     - **Name**: `Juan Buyer`
     - **Email**: `buyer@unimart.test`
     - **Password / Confirm**: `password`
     - **Role**: `student`
   - *(Note: Accounts created by Admin are automatically email-verified.)*
5. **(Optional) Verify Staff Permission Management (`/admin/staff`)**:
   - Navigate to **Management → Staff & Permissions** (`/admin/staff`).
   - Create a test staff member (`staff@unimart.test`), toggle granular operational permissions (e.g., `item.dropoff.approve`, `order.claim.complete`), and then click **Revoke Staff** if you wish to keep only the single Admin account for all counter operations.

---

## Phase 2: Open a Hub Desk Shift (Admin Counter Operations)

Cash-moving operations (completing buyer claims and releasing held cash payouts) are blocked unless the operator has an active shift.

1. In **Window 1 (Admin)**, navigate to **Counter Operations → Drawer Count** (`/staff/drawer-count`).
2. Click **Open Desk Shift**.
3. Enter **Opening Cash Float**: `1000.00` (₱1,000.00) and submit.
4. **Expected Result**:
   - The shift card shows **Active Shift Open**, `Opening Float: ₱1,000.00`, and `Live Expected Cash: ₱1,000.00`.

---

## Phase 3: Seller E-Wallet Setup & Listing Creation (Student A — Seller)

1. **Log in as Seller**:
   - In **Window 2 (Incognito)**, open `/login` and sign in as `seller@unimart.test` / `password`.
   - Confirm you are redirected to **Marketplace → Browse** (`/student/browse`).
2. **Configure E-Wallet Payout Details (`/settings/payout`)**:
   - Click your user profile menu (bottom-left) → **Settings**, then select **Payout settings** (`/settings/payout`).
   - Fill in:
     - **E-Wallet Provider**: `GCash`
     - **Account Name**: `Maria Seller`
     - **Account Number / Mobile**: `09171234567`
     - **Static Receive QR Code**: *(Optional)* Upload any valid static personal QR image (PNG/JPG/WebP).
   - Click **Save Payout Settings**.
3. **Create Three Test Listings (`/student/listings/create`)**:
   - Navigate to **Seller Hub → Sell Item** (`/student/listings/create`) and create the following items:
   - **Listing 1 (For Digital Payout Flow)**:
     - **Title**: `PE Badminton Racket`
     - **Category**: `General → Physical Education`
     - **Condition**: `Good`
     - **Price**: `350.00`
     - **Quantity**: `1`
     - **Photos**: Upload 1 image.
   - **Listing 2 (For Cash Hold & Cash Claim Flow)**:
     - **Title**: `PE Table Tennis Paddle`
     - **Category**: `General → Physical Education`
     - **Condition**: `Like New`
     - **Price**: `250.00`
     - **Quantity**: `1`
     - **Photos**: Upload 1 image.
   - **Listing 3 (For Drop-off Rejection Flow)**:
     - **Title**: `Broken Scientific Calculator`
     - **Category**: `General → Physical Education`
     - **Condition**: `Fair`
     - **Price**: `150.00`
     - **Quantity**: `1`
     - **Photos**: Upload 1 image.
4. **Record Drop-off QR Codes (`/student/listings`)**:
   - Go to **Seller Hub → My Listings** (`/student/listings`).
   - Confirm all 3 items have status **`pending_dropoff`** and are **not** visible in `/student/browse`.
   - Open each item to view/copy its **26-character ULID Drop-off QR Code** (or download the QR PNG).

---

## Phase 4: Physical Drop-Off Inspection at the Hub (Admin Counter Operations)

The seller now brings the physical items to the Campus Hub desk.

1. **Approve Listing 1 (`PE Badminton Racket`)**:
   - In **Window 1 (Admin)**, navigate to **Overview → Scanner** (`/staff/scan`).
   - Paste or scan the **Drop-off QR Code** for `PE Badminton Racket` and click **Resolve Code** (or select it directly from **Counter Operations → Drop-Offs** at `/staff/drop-offs`).
   - Enter **Shelf Location**: `A-01` and click **Approve Drop-Off**.
   - Click **Print Tag** to verify the printable physical tracking tag (`/staff/drop-offs/{item}/tag`) displays the QR code, title, price (`₱350.00`), and shelf `A-01`.
2. **Approve Listing 2 (`PE Table Tennis Paddle`)**:
   - Resolve the Drop-off QR Code for `PE Table Tennis Paddle`.
   - Enter **Shelf Location**: `A-02` and click **Approve Drop-Off**.
3. **Reject Listing 3 (`Broken Scientific Calculator`)**:
   - Resolve the Drop-off QR Code for `Broken Scientific Calculator`.
   - Click **Reject Drop-Off**, enter reason: `"Cracked LCD screen upon physical inspection"`, and confirm.
4. **Expected Result**:
   - Listings 1 and 2 transition to **`available`** and appear in the public catalog.
   - Listing 3 transitions to **`rejected`**.

---

## Phase 5: Browsing, Messaging & Two-Stage Reservation (Student B — Buyer)

1. **Verify Self-Purchase Prevention (while still logged in as Seller)**:
   - In **Window 2**, visit `/student/browse` as `seller@unimart.test`.
   - Open `PE Badminton Racket` and verify you cannot add your own listing to the cart.
   - Log out of `seller@unimart.test`.
2. **Log in as Buyer & Send Inquiry Message**:
   - In **Window 2**, sign in as `buyer@unimart.test` / `password`.
   - On `/student/browse`, filter by category `Physical Education` and open `PE Badminton Racket`.
   - Send a message to the seller: `"Is the grip tape still intact?"`.
   - Verify the thread appears in **Communication & Support → Messages** (`/student/messages`).
3. **Stage 1 — Soft Hold (Add to Cart)**:
   - Add `PE Badminton Racket` (`₱350.00`) and `PE Table Tennis Paddle` (`₱250.00`) to your cart.
   - Navigate to **Marketplace → Cart** (`/student/cart`).
   - **Expected Result**:
     - Both items are reserved under a rolling **15-minute Soft Hold countdown**.
     - In `/student/browse`, both items now have `0` remaining available stock so no other student can hoard them.
4. **Stage 2 — Hard Hold (Commit to Buy)**:
   - In `/student/cart`, click **Commit to Buy / Checkout**.
   - **Expected Result**:
     - You are taken to **Marketplace → My Pickups** (`/student/claims`).
     - The order status is **`pending_handover`** with total **`₱600.00`**.
     - A fixed **24-hour Hard Hold countdown** is active.
     - A unique 26-character ULID **Claim QR Code** is displayed. Copy this Claim QR Code.

---

## Phase 6: Physical Handover & Cash Collection at the Hub (Admin Counter Operations)

The buyer walks to the Campus Hub before the 24-hour timer expires, presents the Claim QR Code, and pays ₱600.00 in cash.

1. In **Window 1 (Admin)**, navigate to **Overview → Scanner** (`/staff/scan`) (or **Counter Operations → Claims** at `/staff/claims`).
2. Paste or scan the buyer's **Claim QR Code** and click **Resolve Code**.
3. Verify the drawer displays:
   - Buyer: `Juan Buyer`
   - Items to retrieve from shelves: `PE Badminton Racket` (`A-01`) and `PE Table Tennis Paddle` (`A-02`)
   - Total Cash to Collect: **`₱600.00`**
4. Collect the cash and click **Complete Handover & Confirm Cash Received**.
5. **Expected Result**:
   - The order status transitions to **`completed`**.
   - Both items transition to **`sold`** (since their remaining quantity is `0` with no other active holds).
   - Two pending seller payouts (`₱350.00` and `₱250.00`) are queued in **Counter Operations → Payouts**.
   - In **Counter Operations → Drawer Count** (`/staff/drawer-count`), **Live Expected Cash** increases from `₱1,000.00` to **`₱1,600.00`** (`₱1,000.00 + ₱600.00`).

---

## Phase 7: Dual-Payout Disbursement (Admin Counter Operations → Seller)

Navigate to **Counter Operations → Payouts** (`/staff/payouts`) in **Window 1 (Admin)**. You will see two items in the **Pending Payouts** tab.

### Path A: Digital Payout (`PE Badminton Racket` — ₱350.00)
1. Click **Process Payout** on `PE Badminton Racket` (`₱350.00`).
2. Select **Disburse Digitally**:
   - Verify `Maria Seller`'s saved GCash details (`09171234567`) and uploaded e-wallet QR code are visible.
3. Click **Confirm Digital Payout**.
4. **Expected Result**:
   - Payout status becomes **`paid_digitally`**.
   - **Live Expected Cash** in `/staff/drawer-count` remains **`₱1,600.00`** (digital transfers do not remove physical cash from the desk drawer).
   - The seller receives a `DigitalPayoutDisbursedNotification`.

### Path B: Hold for Physical Cash Claim → Release Cash (`PE Table Tennis Paddle` — ₱250.00)
1. Click **Process Payout** on `PE Table Tennis Paddle` (`₱250.00`).
2. Select **Hold for Cash Claim**:
   - **Reason**: `Insufficient Digital Funds`
   - **Note**: `"Please claim ₱250.00 cash at the Campus Hub desk."`
3. Click **Hold for Cash Pickup**.
4. **Expected Result (Cash Held)**:
   - Payout status becomes **`cash_held`** and moves to the **Held for Cash** tab.
   - The seller receives a `CashPayoutReadyNotification`.
5. **Seller Claims Physical Cash at the Hub**:
   - In `/staff/payouts`, switch to the **Held for Cash** tab.
   - Click **Release Cash** on `PE Table Tennis Paddle` (`₱250.00`) and confirm.
6. **Expected Result (Cash Claimed)**:
   - Payout status becomes **`cash_claimed`** and moves to **Recent Disbursements**.
   - In `/staff/drawer-count`, **Live Expected Cash** decreases by `₱250.00` to **`₱1,350.00`** (`₱1,000.00 opening + ₱600.00 buyer claim - ₱250.00 cash payout`).

---

## Phase 8: Unsold Item Expiration & Seller Retrieval

To test an unsold item expiring on the shelf without waiting 30 days, you can use **Admin Inventory Takedown** (or run `./vendor/bin/sail artisan unimart:expire-shelf-items`).

1. **Create & Approve One More Item**:
   - As **Seller (`seller@unimart.test`)** in **Window 2**, create a new listing: `Calculus Textbook` (`₱400.00`, Qty `1`).
   - Copy its **Drop-off QR Code**.
   - As **Admin** in **Window 1**, scan the Drop-off QR Code in `/staff/scan`, assign shelf `B-01`, and **Approve**.
2. **Expire / Take Down the Item (`/admin/inventory`)**:
   - In **Window 1 (Admin)**, navigate to **Management → Inventory** (`/admin/inventory`).
   - Locate `Calculus Textbook` (status `available`) and click **Take Down**.
   - **Expected Result**: The item's status changes to **`expired`**.
   - In **Window 2 (Seller)**, check **Seller Hub → Returns** (`/student/returns`). `Calculus Textbook` now appears as ready for retrieval at the Hub along with its original **Drop-off QR Code**.
3. **Physical Retrieval at the Hub (`/staff/scan` or `/staff/returns`)**:
   - In **Window 1 (Admin)**, go to **Overview → Scanner** (`/staff/scan`), paste the **Drop-off QR Code** of `Calculus Textbook`, and click **Resolve Code** (notice the scanner resolves it as a **Retrieval** action!).
   - Click **Confirm Item Returned to Seller** (or click **Retrieve** in **Counter Operations → Returns** at `/staff/returns`).
   - **Expected Result**: The item reaches its terminal **`retrieved`** status.

---

## Phase 9: End-of-Shift Cash Drawer Reconciliation & Audit (Admin)

1. **Close the Active Shift (`/staff/drawer-count`)**:
   - In **Window 1 (Admin)**, navigate to **Counter Operations → Drawer Count** (`/staff/drawer-count`).
   - Review the shift math:
     - **Opening Float**: `₱1,000.00`
     - **Buyer Cash Claims**: `+₱600.00`
     - **Seller Cash Payouts Claimed**: `-₱250.00`
     - **Expected Cash in Drawer**: **`₱1,350.00`**
   - Click **Close Shift & Submit Count**:
     - Enter **Actual Counted Cash**: `1350.00` (or enter `1340.00` if you want to test a `-₱10.00` shortage discrepancy alert).
     - Enter **Shift Notes**: `"End of manual test shift — all transactions reconciled."`
   - Submit to close the shift.
2. **Audit Shift & Financial Logs (`/admin/shift-audits` & `/admin/finances`)**:
   - Navigate to **Management → Shift Audits** (`/admin/shift-audits`) and verify the closed shift record shows opening cash, expected cash, actual cash, and discrepancy.
   - Navigate to **Management → Finances & Logs** (`/admin/finances`) and verify the immutable `hub` activity log displays every action performed (`dropoff_approved`, `dropoff_rejected`, `claim_completed`, `payout_disbursed_digitally`, `payout_held_for_cash`, `cash_payout_released`, `item_taken_down`, `item_retrieved`, `shift_opened`, `shift_closed`).

---

## Phase 10: Dispute Reporting & User Suspension (Student → Admin)

1. **Submit a Student Report (`/student/reports`)**:
   - In **Window 2 (Seller or Buyer)**, navigate to **Communication & Support → My Reports** (`/student/reports`).
   - Submit a report against a user or item with reason: `"Testing dispute resolution workflow."`
2. **Resolve the Report (`/admin/reports`)**:
   - In **Window 1 (Admin)**, navigate to **Management → Reports & Disputes** (`/admin/reports`).
   - Click the pending report, select **Status**: `Resolved`, enter **Resolution Notes**: `"Reviewed and verified during manual test."`, and submit.
3. **Test User Suspension & Reinstatement (`/admin/users`)**:
   - Navigate to **Management → Users** (`/admin/users`).
   - Click **Suspend** on `buyer@unimart.test`.
   - **Expected Result**:
     - In **Window 2**, if `buyer@unimart.test` refreshes any page, they are immediately blocked/logged out by `EnsureUserIsNotSuspended`, any active cart/handover reservations are automatically cancelled with quantities restored, and any active listings are expired.
   - Click **Unsuspend** on `buyer@unimart.test` in `/admin/users` to restore the account.
