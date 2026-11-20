import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Banknote,
    Clock,
    DollarSign,
    Smartphone,
    User,
    Wallet,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import { formatPeso } from '@/lib/utils';
import admin from '@/routes/admin';
import type { PaginatedData } from '@/types/admin';

interface AuditLogEntry {
    id: number;
    event: string | null;
    description: string;
    properties: Record<string, unknown> | null;
    causer: { id: number; name: string; email: string } | null;
    subject_type: string | null;
    subject_id: number | null;
    created_at: string | null;
}

interface AdminFinancesProps {
    metrics: {
        totalSales: string;
        pendingPayouts: string;
        disbursedCash: string;
        disbursedDigital: string;
    };
    auditLogs: PaginatedData<AuditLogEntry>;
}

export default function Finances({ metrics, auditLogs }: AdminFinancesProps) {
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <Head title="Finances & Audit Logs - UniMart Admin" />

            <PageContainer>
                <PageHeader
                    icon={DollarSign}
                    title="Financial Oversight & Hub Audit Logs"
                    description="Track marketplace revenue flow, payout disbursements, and the immutable staff accountability log."
                />

                {/* Financial KPIs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Total Completed Sales</span>
                            <DollarSign className="size-4 text-emerald-600" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {formatPeso(metrics.totalSales)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Pending Payouts</span>
                            <Clock className="size-4 text-amber-600" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {formatPeso(metrics.pendingPayouts)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Disbursed Digitally</span>
                            <Smartphone className="size-4 text-ocean-teal-600 dark:text-seafoam-aqua" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-ocean-teal-600 dark:text-seafoam-aqua tabular-nums">
                            {formatPeso(metrics.disbursedDigital)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Disbursed in Cash</span>
                            <Wallet className="size-4 text-primary" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {formatPeso(metrics.disbursedCash)}
                        </p>
                    </div>
                </div>

                {/* Hub Audit Log Table */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                    <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Activity className="size-4 text-primary" />
                            <h2 className="text-sm font-bold text-foreground">
                                Hub Accountability Trail ({auditLogs.total} entries)
                            </h2>
                        </div>
                    </div>

                    {auditLogs.data.length === 0 ? (
                        <div className="p-12 text-center text-xs text-muted-foreground">
                            No hub audit entries recorded yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {auditLogs.data.map((log) => (
                                <button
                                    key={log.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedLog(log);
                                        setDrawerOpen(true);
                                    }}
                                    className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-left text-xs hover:bg-muted/30 transition cursor-pointer"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {log.event && (
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-[10px]"
                                                >
                                                    {log.event}
                                                </Badge>
                                            )}
                                            <span className="font-semibold text-foreground">
                                                {log.description}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <User className="size-3" />
                                                {log.causer
                                                    ? `${log.causer.name} (${log.causer.email})`
                                                    : 'System'}
                                            </span>
                                            {log.subject_type && (
                                                <span>
                                                    Target: {log.subject_type} #{log.subject_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {log.created_at && (
                                        <span
                                            suppressHydrationWarning
                                            className="text-[11px] text-muted-foreground shrink-0"
                                        >
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {auditLogs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {auditLogs.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={auditLogs.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {auditLogs.current_page} of {auditLogs.last_page}
                        </span>
                        {auditLogs.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={auditLogs.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {selectedLog && (
                        <>
                            <SlidingDrawerHeader
                                icon={Banknote}
                                title={`Audit Entry #${selectedLog.id}`}
                                description={selectedLog.description}
                            />

                            <div className="mt-4 space-y-4 text-xs">
                                <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Event</span>
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {selectedLog.event ?? 'hub'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Processed By</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedLog.causer?.name ?? 'System'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subject</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedLog.subject_type
                                                ? `${selectedLog.subject_type} #${selectedLog.subject_id}`
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Timestamp</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedLog.created_at
                                                ? new Date(selectedLog.created_at).toLocaleString()
                                                : '—'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="font-semibold uppercase text-[10px] text-muted-foreground">
                                        Recorded Properties
                                    </p>
                                    <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-3 font-mono text-[11px] text-foreground">
                                        {JSON.stringify(selectedLog.properties ?? {}, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            <SlidingDrawerFooter className="mt-6">
                                <SlidingDrawerClose asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        Close
                                    </Button>
                                </SlidingDrawerClose>
                            </SlidingDrawerFooter>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>
        </>
    );
}

Finances.layout = {
    breadcrumbs: [
        {
            title: 'Finances',
            href: admin.finances().url,
        },
    ],
};
