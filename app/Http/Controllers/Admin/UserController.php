<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\CreateUser;
use App\Actions\Admin\DeleteUser;
use App\Actions\Admin\SuspendUser;
use App\Actions\Admin\UnsuspendUser;
use App\Actions\Admin\UpdateUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users with account status, listings count, and reports.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $role = $request->string('role')->trim()->value();
        $status = $request->string('status')->trim()->value();

        $users = User::query()
            ->with(['roles'])
            ->withCount(['items', 'receivedReports'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role !== '', function ($query) use ($role) {
                $query->role($role);
            })
            ->when($status !== '', function ($query) use ($status) {
                if ($status === 'suspended') {
                    $query->whereNotNull('suspended_at');
                } elseif ($status === 'active') {
                    $query->whereNull('suspended_at');
                }
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'is_suspended' => $user->isSuspended(),
                'suspended_at' => $user->suspended_at?->toISOString(),
                'items_count' => $user->items_count,
                'reports_count' => $user->received_reports_count,
                'created_at' => $user->created_at?->toISOString(),
            ]);

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request, CreateUser $action): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $action->handle(
            $admin,
            $request->validated(),
            $request->validated('role')
        );

        return redirect()->back();
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user, UpdateUser $action): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $action->handle(
            $admin,
            $user,
            $request->validated(),
            $request->validated('role')
        );

        return redirect()->back();
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user, DeleteUser $action): RedirectResponse
    {
        Gate::authorize('delete', $user);

        /** @var User $admin */
        $admin = $request->user();

        $action->handle($admin, $user);

        return redirect()->back();
    }

    /**
     * Suspend a user account.
     */
    public function suspend(Request $request, User $user, SuspendUser $action): RedirectResponse
    {
        Gate::authorize('suspend', $user);

        /** @var User $admin */
        $admin = $request->user();

        $action->handle($admin, $user);

        return redirect()->back();
    }

    /**
     * Unsuspend a user account.
     */
    public function unsuspend(Request $request, User $user, UnsuspendUser $action): RedirectResponse
    {
        Gate::authorize('suspend', $user);

        /** @var User $admin */
        $admin = $request->user();

        $action->handle($admin, $user);

        return redirect()->back();
    }
}
