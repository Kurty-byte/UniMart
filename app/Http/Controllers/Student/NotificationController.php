<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display the authenticated student's notifications.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest('id')
            ->paginate(15)
            ->through(fn ($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'data' => $n->data,
                'read_at' => $n->read_at?->toISOString(),
                'created_at' => $n->created_at?->toISOString(),
            ]);

        return Inertia::render('student/notifications', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function read(Request $request, string $id): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();

        return redirect()->back();
    }

    /**
     * Mark all unread notifications as read.
     */
    public function readAll(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->unreadNotifications->markAsRead();

        return redirect()->back();
    }
}
