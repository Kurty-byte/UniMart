<?php

use App\Models\User;

dataset('rbac_matrix', [
    // Student endpoints: only student
    ['GET', 'student.browse', ['student'], ['staff']],
    ['GET', 'student.cart', ['student'], ['staff']],
    ['GET', 'student.listings.index', ['student'], ['staff']],
    ['GET', 'student.reports.index', ['student'], ['staff']],

    // Staff endpoints: staff and admin
    ['GET', 'staff.scan', ['staff', 'admin'], ['student']],
    ['GET', 'staff.drop-offs', ['staff', 'admin'], ['student']],
    ['GET', 'staff.claims', ['staff', 'admin'], ['student']],
    ['GET', 'staff.drawer-count', ['staff', 'admin'], ['student']],

    // Admin endpoints: only admin
    ['GET', 'admin.inventory', ['admin'], ['student', 'staff']],
    ['GET', 'admin.users', ['admin'], ['student', 'staff']],
    ['GET', 'admin.finances', ['admin'], ['student', 'staff']],
    ['GET', 'admin.shift-audits', ['admin'], ['student', 'staff']],
    ['GET', 'admin.settings', ['admin'], ['student', 'staff']],
    ['GET', 'admin.staff.index', ['admin'], ['student', 'staff']],
]);

test('enforces strict RBAC boundaries across roles', function (string $method, string $routeName, array $allowedRoles, array $forbiddenRoles) {
    // Unauthenticated guest must be redirected to login
    $guestResponse = $this->call($method, route($routeName));
    expect($guestResponse->status())->toBe(302);

    // Allowed roles
    foreach ($allowedRoles as $role) {
        $user = User::factory()->{$role}()->create();
        $response = $this->actingAs($user)->call($method, route($routeName));
        expect($response->status())->toBe(200);
    }

    // Forbidden roles
    foreach ($forbiddenRoles as $role) {
        $user = User::factory()->{$role}()->create();
        $response = $this->actingAs($user)->call($method, route($routeName));
        expect($response->status())->toBe(403);
    }
})->with('rbac_matrix');
