import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    Compass,
    ExternalLink,
    MessageCircle,
    Send,
    User,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { formatPeso } from '@/lib/utils';
import student from '@/routes/student';

interface MessageThreadSummary {
    id: string;
    item: {
        id: number;
        title: string;
        price: string;
        status: string;
    };
    counterpart: {
        id: number;
        name: string;
        email: string;
    };
    latest_message: {
        content: string;
        created_at: string | null;
        is_mine: boolean;
    };
    unread_count: number;
}

interface ThreadMessage {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    is_mine: boolean;
    read_at: string | null;
    created_at: string | null;
}

interface ActiveThread {
    item: {
        id: number;
        title: string;
        price: string;
    };
    counterpart: {
        id: number;
        name: string;
        email: string;
    };
    messages: ThreadMessage[];
}

interface StudentMessagesProps {
    threads: MessageThreadSummary[];
    activeThread: ActiveThread | null;
    selectedThreadId: string | null;
}

export default function StudentMessages({
    threads = [],
    activeThread,
    selectedThreadId,
}: StudentMessagesProps) {
    const getInitials = useInitials();
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [mobileView, setMobileView] = useState<'list' | 'thread'>(
        activeThread ? 'thread' : 'list',
    );
    const bottomRef = useRef<HTMLDivElement>(null);

    // Poll every 10 seconds for new messages without websockets
    usePoll(10000, {
        only: ['threads', 'activeThread', 'unreadMessagesCount'],
    });

    useEffect(() => {
        if (activeThread) {
            setMobileView('thread');
        }
    }, [selectedThreadId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeThread?.messages.length, selectedThreadId]);

    const handleSelectThread = (thread: MessageThreadSummary) => {
        setMobileView('thread');
        router.get(
            student.messages().url,
            {
                item_id: thread.item.id,
                user_id: thread.counterpart.id,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeThread || !replyText.trim()) {
            return;
        }

        setSending(true);
        router.post(
            student.messages.store().url,
            {
                item_id: activeThread.item.id,
                recipient_id: activeThread.counterpart.id,
                content: replyText.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyText('');
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to send message.');
                },
                onFinish: () => setSending(false),
            },
        );
    };

    return (
        <>
            <Head title="Messages - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={MessageCircle}
                    title="In-App Messages"
                    description="Ask sellers about item condition or answer buyer questions securely within UniMart."
                />

                {threads.length === 0 && !activeThread ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <MessageCircle className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No conversations yet</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Open any catalog item and click &ldquo;Ask Seller a Question&rdquo; to start an item-focused conversation.
                        </p>
                        <Button asChild size="sm" className="mt-5 gap-1.5">
                            <Link href={student.browse().url}>
                                <Compass className="size-4" />
                                Browse Catalog
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 min-h-[540px]">
                        {/* Threads Sidebar */}
                        <div
                            className={`rounded-2xl border border-border bg-card shadow-xs overflow-hidden lg:col-span-4 flex-col ${
                                mobileView === 'thread' && activeThread ? 'hidden lg:flex' : 'flex'
                            }`}
                        >
                            <div className="border-b border-border px-4 py-3 bg-muted/30">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Conversations ({threads.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-border overflow-y-auto max-h-[560px]">
                                {threads.map((thread) => {
                                    const isSelected = selectedThreadId === thread.id;
                                    return (
                                        <button
                                            key={thread.id}
                                            type="button"
                                            onClick={() => handleSelectThread(thread)}
                                            className={`flex w-full items-start gap-3 p-3.5 text-left transition cursor-pointer ${
                                                isSelected
                                                    ? 'bg-primary/10 border-l-2 border-l-primary'
                                                    : 'hover:bg-muted/40'
                                            }`}
                                        >
                                            <Avatar className="size-9 shrink-0">
                                                <AvatarFallback className="text-xs font-semibold bg-ocean-teal/15 text-ocean-teal-700 dark:text-seafoam-aqua">
                                                    {getInitials(thread.counterpart.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="truncate font-semibold text-xs text-foreground">
                                                        {thread.counterpart.name}
                                                    </span>
                                                    {thread.unread_count > 0 && (
                                                        <Badge className="h-5 min-w-5 px-1.5 text-[10px] tabular-nums">
                                                            {thread.unread_count}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="truncate text-[11px] font-medium text-ocean-teal-700 dark:text-seafoam-aqua tabular-nums">
                                                    {thread.item.title} • {formatPeso(thread.item.price)}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {thread.latest_message.is_mine ? 'You: ' : ''}
                                                    {thread.latest_message.content}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active Conversation Pane */}
                        <div
                            className={`rounded-2xl border border-border bg-card shadow-xs overflow-hidden lg:col-span-8 flex-col ${
                                mobileView === 'list' && activeThread ? 'hidden lg:flex' : 'flex'
                            }`}
                        >
                            {activeThread ? (
                                <>
                                    {/* Thread Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setMobileView('list')}
                                                aria-label="Back to conversations"
                                                className="lg:hidden size-9 shrink-0 -ml-1"
                                            >
                                                <ArrowLeft className="size-4" aria-hidden="true" />
                                            </Button>
                                            <Avatar className="size-9 shrink-0">
                                                <AvatarFallback className="text-xs font-semibold bg-primary/15 text-primary">
                                                    {getInitials(activeThread.counterpart.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-foreground truncate">
                                                    {activeThread.counterpart.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate tabular-nums">
                                                    Re: {activeThread.item.title} (
                                                    {formatPeso(activeThread.item.price)})
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5 text-xs"
                                        >
                                            <Link
                                                href={student.items.show({
                                                    item: activeThread.item.id,
                                                }).url}
                                            >
                                                <span>View Item</span>
                                                <ExternalLink className="size-3.5" aria-hidden="true" />
                                            </Link>
                                        </Button>
                                    </div>

                                    {/* Message Stream */}
                                    <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[60dvh] lg:max-h-[420px]">
                                        {activeThread.messages.length === 0 ? (
                                            <div className="py-12 text-center text-sm text-muted-foreground">
                                                Start the conversation by sending a message below.
                                            </div>
                                        ) : (
                                            activeThread.messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col ${
                                                        msg.is_mine ? 'items-end' : 'items-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                                                            msg.is_mine
                                                                ? 'bg-ocean-teal-600 text-white rounded-br-xs'
                                                                : 'bg-muted text-foreground rounded-bl-xs'
                                                        }`}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                                                        {msg.created_at && (
                                                            <span suppressHydrationWarning>
                                                                {new Date(
                                                                    msg.created_at,
                                                                ).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </span>
                                                        )}
                                                        {msg.is_mine && msg.read_at && (
                                                            <CheckCheck className="size-3 text-ocean-teal-600 dark:text-seafoam-aqua" aria-label="Read" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={bottomRef} />
                                    </div>

                                    {/* Reply Composer */}
                                    <form
                                        onSubmit={handleSendReply}
                                        className="flex items-end gap-2 border-t border-border p-3 bg-muted/20"
                                    >
                                        <Textarea
                                            rows={2}
                                            aria-label="Message reply"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key !== 'Enter' ||
                                                    e.shiftKey ||
                                                    e.ctrlKey ||
                                                    e.metaKey ||
                                                    e.altKey
                                                ) {
                                                    return;
                                                }
                                                e.preventDefault();
                                                if (
                                                    e.nativeEvent.isComposing ||
                                                    e.keyCode === 229 ||
                                                    e.repeat
                                                ) {
                                                    return;
                                                }
                                                handleSendReply(e);
                                            }}
                                            placeholder="Type a message... (Enter to send)"
                                            maxLength={1000}
                                            className="min-h-11 bg-background flex-1 rounded-xl resize-none"
                                        />
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={sending || !replyText.trim()}
                                            className="h-10 gap-1.5 px-4 shrink-0"
                                        >
                                            <Send className="size-3.5" aria-hidden="true" />
                                            <span>Send</span>
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                    <User className="size-10 opacity-30 mb-2" aria-hidden="true" />
                                    <p className="text-sm font-medium text-foreground">
                                        Select a conversation
                                    </p>
                                    <p className="text-xs mt-1">
                                        Choose a thread from the left to view messages.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </PageContainer>
        </>
    );
}

StudentMessages.layout = {
    breadcrumbs: [
        {
            title: 'Messages',
            href: student.messages().url,
        },
    ],
};
