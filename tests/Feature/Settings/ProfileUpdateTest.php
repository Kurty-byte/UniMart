<?php

use App\Models\Item;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});

test('user with listings cannot delete their account', function () {
    $user = User::factory()->student()->create();
    Item::factory()->for($user, 'seller')->create();

    $this->actingAs($user)
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertSessionHasErrors('password');

    expect($user->fresh())->not->toBeNull();
});

test('deleting a category with items is blocked at the database level', function () {
    $item = Item::factory()->create();

    expect(fn () => $item->category->delete())->toThrow(QueryException::class);
});

test('profile page provides ewallet props and qr url when set', function () {
    $user = User::factory()->student()->create([
        'ewallet_qr_code' => 'ewallet-qr/1/code.png',
        'ewallet_provider' => 'gcash',
        'ewallet_account_name' => 'Test Name',
        'ewallet_account_number' => '09171234567',
    ]);

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('hasEwalletQr', true)
            ->where('ewalletQrUrl', route('users.ewallet-qr.show', $user))
        );
});

test('user can upload an avatar and replace old one', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $firstAvatar = UploadedFile::fake()->image('avatar1.png');
    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $firstAvatar,
        ])
        ->assertRedirect(route('profile.edit'));

    $user->refresh();
    $firstPath = $user->getRawOriginal('avatar');
    expect($firstPath)->not->toBeNull();
    Storage::disk('public')->assertExists($firstPath);

    // Replace with second avatar
    $secondAvatar = UploadedFile::fake()->image('avatar2.jpg');
    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $secondAvatar,
        ])
        ->assertRedirect(route('profile.edit'));

    $user->refresh();
    $secondPath = $user->getRawOriginal('avatar');
    expect($secondPath)->not->toBe($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('user can remove their avatar', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $avatar = UploadedFile::fake()->image('avatar.png');

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $avatar,
        ]);

    $storedPath = $user->fresh()->getRawOriginal('avatar');
    Storage::disk('public')->assertExists($storedPath);

    // Remove avatar
    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'remove_avatar' => true,
        ])
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh()->getRawOriginal('avatar'))->toBeNull();
    Storage::disk('public')->assertMissing($storedPath);
});

test('avatar upload rejects invalid file types or oversized files', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->create('doc.pdf', 500, 'application/pdf'),
        ])
        ->assertSessionHasErrors('avatar');
});

test('user can update e-wallet fields and upload e-wallet QR code', function () {
    Storage::fake('local');
    $user = User::factory()->create();

    $qr = UploadedFile::fake()->image('gcash-qr.png');
    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'ewallet_provider' => 'gcash',
            'ewallet_account_name' => 'Juan Dela Cruz',
            'ewallet_account_number' => '09181234567',
            'ewallet_qr' => $qr,
        ])
        ->assertRedirect(route('profile.edit'));

    $fresh = $user->fresh();
    expect($fresh->ewallet_provider)->toBe('gcash');
    expect($fresh->ewallet_account_name)->toBe('Juan Dela Cruz');
    expect($fresh->ewallet_account_number)->toBe('09181234567');
    expect($fresh->ewallet_qr_code)->not->toBeNull();
    Storage::disk('local')->assertExists($fresh->ewallet_qr_code);
});

test('user can remove their e-wallet QR code', function () {
    Storage::fake('local');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'ewallet_qr' => UploadedFile::fake()->image('qr.png'),
        ]);

    $qrPath = $user->fresh()->ewallet_qr_code;
    Storage::disk('local')->assertExists($qrPath);

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'remove_ewallet_qr' => true,
        ])
        ->assertRedirect(route('profile.edit'));

    $fresh = $user->fresh();
    expect($fresh->ewallet_qr_code)->toBeNull();
    Storage::disk('local')->assertMissing($qrPath);
});

test('rejects dynamic QR payload in profile update', function () {
    $user = User::factory()->create();
    $dynamicPayload = '00020101021253036085802PH5914Juan Dela Cruz6006Manila63041234';

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'qr_payload' => $dynamicPayload,
        ])
        ->assertSessionHasErrors('qr_payload');
});
