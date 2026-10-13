<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\SuspendUser;
use App\Actions\Admin\UnsuspendUser;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users with account status, listings count, and reports.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with(['roles'])
            ->withCount(['items', 'receivedReports'])
            ->latest('id')
            ->paginate(15)
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
        ]);
    }

    /**
     * Suspend a user account.
     */
    public function suspend(Request $request, User $user, SuspendUser $action): RedirectResponse
    {
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
        /** @var User $admin */
        $admin = $request->user();

        $action->handle($admin, $user);

        return redirect()->back();
    }
}
