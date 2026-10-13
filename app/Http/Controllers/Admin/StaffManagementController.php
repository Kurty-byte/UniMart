<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\CreateStaffUser;
use App\Actions\Admin\UpdateStaffPermissions;
use App\Enums\HubEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\UpdateStaffPermissionsRequest;
use App\Models\User;
use App\Support\HubAudit;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffManagementController extends Controller
{
    /**
     * Display a listing of staff members and operational permissions.
     */
    public function index(Request $request): Response
    {
        $staffMembers = User::role('staff')
            ->with(['permissions', 'roles'])
            ->latest('id')
            ->paginate(15)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'permissions' => $user->permissions->pluck('name'),
                'roles' => $user->roles->pluck('name'),
                'created_at' => $user->created_at?->toISOString(),
            ]);

        return Inertia::render('admin/staff', [
            'staffMembers' => $staffMembers,
            'availablePermissions' => RoleAndPermissionSeeder::STAFF_OPERATIONAL_PERMISSIONS,
        ]);
    }

    /**
     * Create a new staff account with operational permissions.
     */
    public function store(StoreStaffRequest $request, CreateStaffUser $action): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $action->handle(
            $admin,
            $request->validated(),
            $request->validated('permissions', [])
        );

        return redirect()->back();
    }

    /**
     * Update operational permissions for an existing staff member.
     */
    public function updatePermissions(UpdateStaffPermissionsRequest $request, User $user, UpdateStaffPermissions $action): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $action->handle(
            $admin,
            $user,
            $request->validated('permissions', [])
        );

        return redirect()->back();
    }

    /**
     * Revoke staff role and direct permissions from a user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $user->removeRole('staff');
        $user->syncPermissions([]);

        HubAudit::record(
            HubEvent::StaffRoleRevoked,
            $user,
            $admin,
            ['email' => $user->email]
        );

        return redirect()->back();
    }
}
