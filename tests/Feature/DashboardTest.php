<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('admin users can visit the dashboard with marketplace metrics', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('metrics.totalSales')
            ->has('metrics.pendingDropoffsCount')
            ->has('metrics.pendingClaimsCount')
            ->has('metrics.openShiftsCount')
            ->has('metrics.pendingReportsCount')
            ->has('recentAuditLogs')
        );
});

test('student users are redirected from dashboard to browse catalog', function () {
    $user = User::factory()->student()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('student.browse'));
});
