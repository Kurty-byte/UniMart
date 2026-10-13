<?php

namespace App\Http\Controllers\Student;

use App\Actions\Messaging\MarkThreadAsRead;
use App\Actions\Messaging\SendMessage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\SendMessageRequest;
use App\Models\Item;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    /**
     * Display student conversations grouped by item and counterpart.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $allMessages = Message::query()
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id);
            })
            ->with(['item:id,title,price,status,shelf_location', 'sender:id,name,email', 'receiver:id,name,email'])
            ->latest('id')
            ->get();

        $threadsGrouped = [];
        foreach ($allMessages as $msg) {
            $counterpart = $msg->sender_id === $user->id ? $msg->receiver : $msg->sender;
            if (! $msg->item || ! $counterpart) {
                continue;
            }

            $threadKey = "{$msg->item_id}_{$counterpart->id}";

            if (! isset($threadsGrouped[$threadKey])) {
                $threadsGrouped[$threadKey] = [
                    'id' => $threadKey,
                    'item' => [
                        'id' => $msg->item->id,
                        'title' => $msg->item->title,
                        'price' => $msg->item->price,
                        'status' => $msg->item->status->value,
                    ],
                    'counterpart' => [
                        'id' => $counterpart->id,
                        'name' => $counterpart->name,
                        'email' => $counterpart->email,
                    ],
                    'latest_message' => [
                        'content' => $msg->content,
                        'created_at' => $msg->created_at?->toISOString(),
                        'is_mine' => $msg->sender_id === $user->id,
                    ],
                    'unread_count' => 0,
                ];
            }

            if ($msg->receiver_id === $user->id && $msg->read_at === null) {
                $threadsGrouped[$threadKey]['unread_count']++;
            }
        }

        $threads = array_values($threadsGrouped);

        $selectedItemId = $request->query('item_id');
        $selectedUserId = $request->query('user_id');

        $activeThread = null;
        $selectedThreadId = null;

        if ($selectedItemId && $selectedUserId) {
            $selectedThreadId = "{$selectedItemId}_{$selectedUserId}";
        } elseif (count($threads) > 0) {
            $firstThread = $threads[0];
            $selectedItemId = $firstThread['item']['id'];
            $selectedUserId = $firstThread['counterpart']['id'];
            $selectedThreadId = $firstThread['id'];
        }

        if ($selectedItemId && $selectedUserId) {
            $counterpart = User::find($selectedUserId);
            $item = Item::find($selectedItemId);

            if ($counterpart && $item) {
                app(MarkThreadAsRead::class)->handle($user, $item, $counterpart);

                $threadMessages = Message::query()
                    ->where('item_id', $item->id)
                    ->where(function ($q) use ($user, $counterpart) {
                        $q->where(function ($sub) use ($user, $counterpart) {
                            $sub->where('sender_id', $user->id)
                                ->where('receiver_id', $counterpart->id);
                        })->orWhere(function ($sub) use ($user, $counterpart) {
                            $sub->where('sender_id', $counterpart->id)
                                ->where('receiver_id', $user->id);
                        });
                    })
                    ->oldest('id')
                    ->get()
                    ->map(fn (Message $m) => [
                        'id' => $m->id,
                        'sender_id' => $m->sender_id,
                        'receiver_id' => $m->receiver_id,
                        'content' => $m->content,
                        'is_mine' => $m->sender_id === $user->id,
                        'read_at' => $m->read_at?->toISOString(),
                        'created_at' => $m->created_at?->toISOString(),
                    ]);

                $activeThread = [
                    'item' => [
                        'id' => $item->id,
                        'title' => $item->title,
                        'price' => $item->price,
                    ],
                    'counterpart' => [
                        'id' => $counterpart->id,
                        'name' => $counterpart->name,
                        'email' => $counterpart->email,
                    ],
                    'messages' => $threadMessages,
                ];
            }
        }

        return Inertia::render('student/messages', [
            'threads' => $threads,
            'activeThread' => $activeThread,
            'selectedThreadId' => $selectedThreadId,
        ]);
    }

    /**
     * Send a new message or reply in an item conversation.
     */
    public function store(SendMessageRequest $request, SendMessage $action): RedirectResponse
    {
        /** @var User $sender */
        $sender = $request->user();

        /** @var Item $item */
        $item = Item::findOrFail($request->validated('item_id'));

        /** @var User $recipient */
        $recipient = User::findOrFail($request->validated('recipient_id'));

        $action->handle($sender, $item, $recipient, $request->validated('content'));

        return redirect()->route('student.messages', [
            'item_id' => $item->id,
            'user_id' => $recipient->id,
        ]);
    }

    /**
     * Mark an entire conversation thread as read.
     */
    public function read(Request $request, Item $item, User $user, MarkThreadAsRead $action): RedirectResponse
    {
        /** @var User $reader */
        $reader = $request->user();

        $action->handle($reader, $item, $user);

        return redirect()->back();
    }
}
