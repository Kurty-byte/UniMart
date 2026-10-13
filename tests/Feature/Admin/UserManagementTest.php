<?php

use App\Enums\HubEvent;
use App\Models\Item;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

it('displays paginated user list with search and filter capabilities', function () {
    $admin = User::factory()->admin()->create();
    $alice = User::factory()->student()->create([
        'name' => 'Alice Wonderland',
        'email' => 'alice@university.edu.ph',
    ]);
    $bob = User::factory()->staff()->create([
        'name' => 'Bob Builder',
        'email' => 'bob@university.edu.ph',
    ]);

    // Unfiltered
    $this->actingAs($admin)->get(route('admin.users'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users')
            ->has('users.data')
            ->has('filters')
        );

    // Search by name
    $this->actingAs($admin)->get(route('admin.users', ['search' => 'Alice']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users')
            ->where('users.data.0.id', $alice->id)
            ->has('users.data', 1)
        );

    // Filter by role
    $this->actingAs($admin)->get(route('admin.users', ['role' => 'staff']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users')
            ->where('users.data.0.id', $bob->id)
            ->has('users.data', 1)
        );
});

it('creates a new user with specified role and records HubAudit', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Charlie Brown',
        'email' => 'charlie@university.edu.ph',
        'password' => 'secret1234',
        'password_confirmation' => 'secret1234',
        'role' => 'student',
    ]);

    $response->assertRedirect();

    $user = User::where('email', 'charlie@university.edu.ph')->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Charlie Brown')
        ->and(Hash::check('secret1234', $user->password))->toBeTrue()
        ->and($user->hasRole('student'))->toBeTrue();

    $activity = Activity::inLog('hub')->where('event', HubEvent::UserCreated->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue()
        ->and($activity->subject->is($user))->toBeTrue()
        ->and($activity->getProperty('role'))->toBe('student');
});

it('validates user creation input', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->create(['email' => 'existing@university.edu.ph']);

    $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => '',
        'email' => 'existing@university.edu.ph',
        'password' => 'short',
        'password_confirmation' => 'mismatch',
        'role' => 'invalid_role',
    ])->assertSessionHasErrors(['name', 'email', 'password', 'role']);
});

it('updates user name and password when new password provided', function () {
    $admin = User::factory()->admin()->create();
    $student = User::factory()->student()->create([
        'name' => 'Original Name',
        'password' => Hash::make('oldpassword'),
    ]);

    $response = $this->actingAs($admin)->put(route('admin.users.update', $student), [
        'name' => 'Updated Name',
        'email' => $student->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
        'role' => 'student',
    ]);

    $response->assertRedirect();

    $freshStudent = $student->fresh();
    expect($freshStudent->name)->toBe('Updated Name')
        ->and(Hash::check('newpassword123', $freshStudent->password))->toBeTrue();

    $activity = Activity::inLog('hub')->where('event', HubEvent::UserUpdated->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue()
        ->and($activity->getProperty('password_updated'))->toBeTrue();
});

it('updates user name without changing password when password is empty', function () {
    $admin = User::factory()->admin()->create();
    $student = User::factory()->student()->create([
        'name' => 'Original Name',
        'password' => Hash::make('stillthesame'),
    ]);

    $response = $this->actingAs($admin)->put(route('admin.users.update', $student), [
        'name' => 'New Name Only',
        'email' => $student->email,
        'password' => '',
        'password_confirmation' => '',
        'role' => 'student',
    ]);

    $response->assertRedirect();

    $freshStudent = $student->fresh();
    expect($freshStudent->name)->toBe('New Name Only')
        ->and(Hash::check('stillthesame', $freshStudent->password))->toBeTrue();

    $activity = Activity::inLog('hub')->where('event', HubEvent::UserUpdated->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->getProperty('password_updated'))->toBeFalse();
});

it('updates user role and prevents self-demotion or sole admin demotion', function () {
    $admin = User::factory()->admin()->create();
    $student = User::factory()->student()->create();

    // Promote student to staff
    $this->actingAs($admin)->put(route('admin.users.update', $student), [
        'name' => $student->name,
        'email' => $student->email,
        'role' => 'staff',
    ])->assertRedirect();

    expect($student->fresh()->hasRole('staff'))->toBeTrue();

    // Admin attempts to demote self
    $this->actingAs($admin)->put(route('admin.users.update', $admin), [
        'name' => $admin->name,
        'email' => $admin->email,
        'role' => 'student',
    ])->assertSessionHasErrors(['role']);

    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

it('deletes an eligible user without marketplace history and records HubAudit', function () {
    $admin = User::factory()->admin()->create();
    $student = User::factory()->student()->create();

    $response = $this->actingAs($admin)->delete(route('admin.users.destroy', $student));
    $response->assertRedirect();

    expect(User::find($student->id))->toBeNull();

    $activity = Activity::inLog('hub')->where('event', HubEvent::UserDeleted->value)->first();
    expect($activity)->not->toBeNull()
        ->and($activity->causer->is($admin))->toBeTrue();
});

it('prevents an administrator from deleting their own account', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->delete(route('admin.users.destroy', $admin))
        ->assertSessionHasErrors(['user']);

    expect(User::find($admin->id))->not->toBeNull();
});

it('prevents deleting a user with marketplace history', function () {
    $admin = User::factory()->admin()->create();
    $seller = User::factory()->student()->create();
    Item::factory()->create(['seller_id' => $seller->id]);

    expect($seller->hasMarketplaceHistory())->toBeTrue();

    $this->actingAs($admin)->delete(route('admin.users.destroy', $seller))
        ->assertSessionHasErrors(['user']);

    expect(User::find($seller->id))->not->toBeNull();
});

it('prevents non-admins from executing user CRUD operations', function () {
    $student = User::factory()->student()->create();
    $target = User::factory()->student()->create();

    $this->actingAs($student)->post(route('admin.users.store'), [
        'name' => 'Hacker',
        'email' => 'hacker@university.edu.ph',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'admin',
    ])->assertForbidden();

    $this->actingAs($student)->put(route('admin.users.update', $target), [
        'name' => 'Hacked',
        'email' => $target->email,
        'role' => 'student',
    ])->assertForbidden();

    $this->actingAs($student)->delete(route('admin.users.destroy', $target))
        ->assertForbidden();
});
