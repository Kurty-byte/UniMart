<?php

use App\Models\User;

it('throttles excessive cart heartbeat pings', function () {
    $buyer = User::factory()->student()->create();

    for ($i = 0; $i < 20; $i++) {
        $this->actingAs($buyer)->post(route('student.cart.heartbeat'))->assertOk();
    }

    $this->actingAs($buyer)->post(route('student.cart.heartbeat'))->assertStatus(429);
});

it('throttles rapid QR scan requests', function () {
    $staff = User::factory()->staff()->create();

    for ($i = 0; $i < 30; $i++) {
        $this->actingAs($staff)->postJson(route('staff.scan.resolve'), ['code' => 'INVALID_CODE']);
    }

    $this->actingAs($staff)->postJson(route('staff.scan.resolve'), ['code' => 'INVALID_CODE'])->assertStatus(429);
});
