<?php

use App\Models\User;

it('rejects login for suspended users', function () {
    $user = User::factory()->student()->suspended()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('logs out a user suspended mid-session', function () {
    $user = User::factory()->student()->create();
    $this->actingAs($user);
    $user->forceFill(['suspended_at' => now()])->save();

    $this->get(route('student.browse'))->assertRedirect(route('login'));
    $this->assertGuest();
});

it('returns 403 on json requests when user is suspended mid-session', function () {
    $user = User::factory()->student()->create();
    $this->actingAs($user);
    $user->forceFill(['suspended_at' => now()])->save();

    $this->getJson(route('student.browse'))->assertForbidden();
    $this->assertGuest();
});
