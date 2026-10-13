<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => Storage::fake('local'));

it('renders the payout settings page with current QR status', function () {
    $student = User::factory()->student()->create();

    $this->actingAs($student)->get(route('payout.edit'))
        ->assertInertia(fn (Assert $page) => $page->component('settings/payout')
            ->where('ewalletQrUrl', null)
            ->where('hasEwalletQr', false));
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
