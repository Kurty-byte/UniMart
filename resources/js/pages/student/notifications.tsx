import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Bell,
    Check,
    CheckCheck,
    Clock,
    ExternalLink,
    Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import student from '@/routes/student';
import type { PaginatedData } from '@/types/admin';

interface NotificationEntry {
    id: string;
    type: string;
    data: {
        kind?: string;
        title?: string;
        body?: string;
        url?: string;
    };
    read_at: string | null;
    created_at: string | null;
}

interface NotificationsProps {
    notifications: PaginatedData<NotificationEntry>;
}

function NotificationIcon({ kind }: { kind?: string }) {
    switch (kind) {
        case 'digital_payout_disbursed':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Wallet className="size-5" />
                </div>
            );
        case 'cash_payout_ready':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ocean-teal/15 text-ocean-teal dark:text-seafoam-aqua">
                    <Banknote className="size-5" />
                </div>
            );
        case 'item_shelf_expired':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Clock className="size-5" />
                </div>
            );
        case 'order_reservation_expired':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="size-5" />
                </div>
            );
        default:
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bell className="size-5" />
                </div>
            );
    }
}

export default function StudentNotifications({ notifications }: NotificationsProps) {
    const [markingAll, setMarkingAll] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);

    const hasUnread = notifications.data.some((n) => n.read_at === null);

    const handleMarkRead = (id: string) => {
        setBusyId(id);
        router.post(
            student.notifications.read({ id }).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyId(null),
            },
        );
    };

    const handleMarkAllRead = () => {
        setMarkingAll(true);
        router.post(
            student.notifications.readAll().url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('All notifications marked as read.'),
                onFinish: () => setMarkingAll(false),
            },
        );
    };

    return (
        <>
            <Head title="Notifications - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={Bell}
                    title="Notifications"
                    description="Alerts for payouts, cash pickups, shelf expirations, and order reservations."
                    actions={
                        hasUnread && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={markingAll}
                                onClick={handleMarkAllRead}
                                className="gap-1.5 text-xs"
                            >
                                <CheckCheck className="size-4" />
                                {markingAll ? 'Updating...' : 'Mark All as Read'}
                            </Button>
                        )
                    }
                />

                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Bell className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">You&apos;re all caught up!</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Notifications about your payouts, expired shelf items, and reservations will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {notifications.data.map((notification) => {
                            const isUnread = notification.read_at === null;
                            return (
                                <div
                                    key={notification.id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition ${
                                        isUnread ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-3.5 min-w-0">
                                        <NotificationIcon kind={notification.data?.kind} />
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm text-foreground">
                                                    {notification.data?.title ?? 'Hub Update'}
                                                </p>
                                                {isUnread && (
                                                    <Badge className="h-4 px-1.5 text-[10px]">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {notification.data?.body ?? ''}
                                            </p>
                                            {notification.created_at && (
                                                <p className="text-[11px] text-muted-foreground">
                                                    {new Date(
                                                        notification.created_at,
                                                    ).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        {notification.data?.url && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <Link href={notification.data.url}>
                                                    <span>View</span>
                                                    <ExternalLink className="size-3" />
                                                </Link>
                                            </Button>
                                        )}
                                        {isUnread && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={busyId === notification.id}
                                                onClick={() => handleMarkRead(notification.id)}
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <Check className="size-3.5" />
                                                Read
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        {notifications.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={notifications.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {notifications.current_page} of {notifications.last_page}
                        </span>
                        {notifications.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={notifications.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>
        </>
    );
}

StudentNotifications.layout = {
    breadcrumbs: [
        {
            title: 'Notifications',
            href: student.notifications().url,
        },
    ],
};
