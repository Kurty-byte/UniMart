<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => Storage::fake('local'));

it('renders the payout settings page with current QR status and account fields', function () {
    $student = User::factory()->student()->create([
        'ewallet_provider' => 'gcash',
        'ewallet_account_name' => 'Maria Clara',
        'ewallet_account_number' => '09181234567',
    ]);

    $this->actingAs($student)->get(route('payout.edit'))
        ->assertInertia(fn (Assert $page) => $page->component('settings/payout')
            ->where('ewalletQrUrl', null)
            ->where('hasEwalletQr', false)
            ->where('ewalletProvider', 'gcash')
            ->where('ewalletAccountName', 'Maria Clara')
            ->where('ewalletAccountNumber', '09181234567'));
});

it('stores the e-wallet QR privately and replaces the old one', function () {
    $student = User::factory()->student()->create();

    $this->actingAs($student)->put(route('payout.update'), [
        'ewallet_qr' => UploadedFile::fake()->image('gcash.png'),
    ])->assertRedirect(route('payout.edit'));

    $first = $student->fresh()->ewallet_qr_code;
    expect($first)->not->toBeNull();
    Storage::disk('local')->assertExists($first);

    $this->actingAs($student)->put(route('payout.update'), [
        'ewallet_qr' => UploadedFile::fake()->image('maya.png'),
    ])->assertRedirect(route('payout.edit'));

    Storage::disk('local')->assertMissing($first);
    Storage::disk('local')->assertExists($student->fresh()->ewallet_qr_code);
});

it('rejects non-image uploads', function () {
    $student = User::factory()->student()->create();

    $this->actingAs($student)->put(route('payout.update'), [
        'ewallet_qr' => UploadedFile::fake()->create('qr.pdf', 10, 'application/pdf'),
    ])->assertSessionHasErrors('ewallet_qr');
});

it('lets the owner and payout staff view the QR but not other students', function () {
    $owner = User::factory()->student()->create(['ewallet_qr_code' => 'ewallet-qr/1/a.png']);
    Storage::disk('local')->put('ewallet-qr/1/a.png', 'img-content');

    // Owner can view
    $this->actingAs($owner)->get(route('users.ewallet-qr.show', $owner))->assertOk();

    // Staff with process payouts permission can view
    $staff = User::factory()->staff()->create();
    $this->actingAs($staff)->get(route('users.ewallet-qr.show', $owner))->assertOk();

    // Other student is forbidden
    $other = User::factory()->student()->create();
    $this->actingAs($other)->get(route('users.ewallet-qr.show', $owner))->assertForbidden();
});

it('removes the QR on destroy and deletes the file', function () {
    $student = User::factory()->student()->create();

    $this->actingAs($student)->put(route('payout.update'), [
        'ewallet_qr' => UploadedFile::fake()->image('qr.png'),
    ]);
    $stored = $student->fresh()->ewallet_qr_code;

    $this->actingAs($student)->delete(route('payout.destroy'))
        ->assertRedirect(route('payout.edit'));

    expect($student->fresh()->ewallet_qr_code)->toBeNull();
    Storage::disk('local')->assertMissing($stored);
});

it('rejects QR payload containing a fixed amount in Tag 54', function () {
    $student = User::factory()->student()->create();

    $fixedAmountPayload = '00020101021153036085406250.005802PH5914Juan Dela Cruz6006Manila63041234';

    $this->actingAs($student)->put(route('payout.update'), [
        'ewallet_qr' => UploadedFile::fake()->image('fixed_amount.png'),
        'qr_payload' => $fixedAmountPayload,
    ])->assertSessionHasErrors(['qr_payload']);
});

it('rejects dynamic single-use QR payload', function () {
    $student = User::factory()->student()->create();

    $dynamicPayload = '00020101021253036085802PH5914Juan Dela Cruz6006Manila63041234';

    $this->actingAs($student)->put(route('payout.update'), [
        'ewallet_qr' => UploadedFile::fake()->image('dynamic.png'),
        'qr_payload' => $dynamicPayload,
    ])->assertSessionHasErrors(['qr_payload']);
});

it('updates account details and saves valid static QR payload', function () {
    $student = User::factory()->student()->create();

    $staticPayload = '00020101021153036085802PH5914Juan Dela Cruz6006Manila63041234';

    $this->actingAs($student)->put(route('payout.update'), [
        'ewallet_provider' => 'gcash',
        'ewallet_account_name' => 'Juan Dela Cruz',
        'ewallet_account_number' => '09171234567',
        'qr_payload' => $staticPayload,
        'ewallet_qr' => UploadedFile::fake()->image('valid_qr.png'),
    ])->assertRedirect(route('payout.edit'));

    $fresh = $student->fresh();
    expect($fresh->ewallet_provider)->toBe('gcash')
        ->and($fresh->ewallet_account_name)->toBe('Juan Dela Cruz')
        ->and($fresh->ewallet_account_number)->toBe('09171234567')
        ->and($fresh->ewallet_qr_payload)->toBe($staticPayload)
        ->and($fresh->hasEwalletQr())->toBeTrue();
});
