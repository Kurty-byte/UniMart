<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('registration rejects emails outside the allowed domains', function () {
    config(['unimart.allowed_email_domains' => ['university.edu.ph']]);

    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@gmail.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('email');
});

test('registration accepts allowed domains case-insensitively', function () {
    config(['unimart.allowed_email_domains' => ['university.edu.ph']]);

    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'Test@University.edu.ph',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasNoErrors();

    expect(\App\Models\User::first()->hasRole('student'))->toBeTrue();
});
