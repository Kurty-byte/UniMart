import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Banknote,
    Calculator,
    Clock,
    DollarSign,
    Flag,
    LayoutGrid,
    List,
    Package,
    PackageCheck,
    QrCode,
    Settings,
    ShieldCheck,
    Users,
    Wallet,
} from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPeso } from '@/lib/utils';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import staff from '@/routes/staff';

interface DashboardMetrics {
    totalSales: string;
    pendingPayoutsTotal: string;
    cashHeldTotal: string;
    completedOrdersCount: number;
    availableItemsCount: number;
    pendingDropoffsCount: number;
    pendingClaimsCount: number;
    expiredItemsCount: number;
    openShiftsCount: number;
    pendingReportsCount: number;
    totalStudentsCount: number;
    totalStaffCount: number;
}

interface RecentAuditLog {
    id: number;
    event: string | null;
    description: string;
    causer: { id: number; name: string } | null;
    subject_type: string | null;
    subject_id: number | null;
    created_at: string | null;
}

interface DashboardProps {
    metrics?: DashboardMetrics;
    recentAuditLogs?: RecentAuditLog[];
}

export default function Dashboard({ metrics, recentAuditLogs = [] }: DashboardProps) {
    return (
        <>
            <Head title="Admin Dashboard - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={LayoutGrid}
                    title="Campus Hub Executive Overview"
                    description="Real-time financial integrity, consignment inventory, shift status, and moderation queues."
                    actions={
                        <>
                            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                                <Link href={admin.settings().url}>
                                    <Settings className="size-3.5" />
                                    System Timers
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="gap-1.5 text-xs">
                                <Link href={staff.scan().url}>
                                    <QrCode className="size-3.5" />
                                    Desk Scanner
                                </Link>
                            </Button>
                        </>
                    }
                />

                {/* Financial & Sales KPIs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Completed Sales Volume</span>
                            <DollarSign className="size-4 text-emerald-600" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {formatPeso(metrics?.totalSales)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                            {metrics?.completedOrdersCount ?? 0} completed hub handovers
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Pending Payouts</span>
                            <Banknote className="size-4 text-amber-600" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {formatPeso(metrics?.pendingPayoutsTotal)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Awaiting digital or cash selection
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Held Cash Liability</span>
                            <Wallet className="size-4 text-ocean-teal-600 dark:text-seafoam-aqua" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-ocean-teal-600 dark:text-seafoam-aqua tabular-nums">
                            {formatPeso(metrics?.cashHeldTotal)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Cash ready at desk for sellers
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Active Shifts & Users</span>
                            <Users className="size-4 text-primary" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {metrics?.openShiftsCount ?? 0}{' '}
                            <span className="text-sm font-medium text-muted-foreground">
                                open shift{(metrics?.openShiftsCount ?? 0) === 1 ? '' : 's'}
                            </span>
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                            {metrics?.totalStudentsCount ?? 0} students •{' '}
                            {metrics?.totalStaffCount ?? 0} staff
                        </p>
                    </div>
                </div>

                {/* Operational Queues Grid */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <Link
                        href={staff.dropOffs().url}
                        className="rounded-2xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40"
                    >
                        <div className="flex items-center justify-between">
                            <Package className="size-4 text-amber-600" aria-hidden="true" />
                            <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {metrics?.pendingDropoffsCount ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Pending Drop-Offs</p>
                    </Link>

                    <Link
                        href={staff.claims().url}
                        className="rounded-2xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40"
                    >
                        <div className="flex items-center justify-between">
                            <PackageCheck className="size-4 text-ocean-teal-600 dark:text-seafoam-aqua" aria-hidden="true" />
                            <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {metrics?.pendingClaimsCount ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Active Hard Holds</p>
                    </Link>

                    <Link
                        href={admin.inventory().url}
                        className="rounded-2xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40"
                    >
                        <div className="flex items-center justify-between">
                            <List className="size-4 text-emerald-600" aria-hidden="true" />
                            <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {metrics?.availableItemsCount ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Live Catalog Items</p>
                    </Link>

                    <Link
                        href={staff.returns().url}
                        className="rounded-2xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40"
                    >
                        <div className="flex items-center justify-between">
                            <Clock className="size-4 text-rose-600" aria-hidden="true" />
                            <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {metrics?.expiredItemsCount ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Expired on Shelf</p>
                    </Link>

                    <Link
                        href={admin.reports.index().url}
                        className="rounded-2xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40 col-span-2 lg:col-span-1"
                    >
                        <div className="flex items-center justify-between">
                            <Flag className="size-4 text-destructive" aria-hidden="true" />
                            <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">
                            {metrics?.pendingReportsCount ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Pending Reports</p>
                    </Link>
                </div>

                {/* Bottom Grid: Recent Audit Logs + Oversight Links */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden lg:col-span-8">
                        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Activity className="size-4 text-primary" />
                                <h2 className="text-sm font-bold text-foreground">
                                    Recent Hub Audit Activity
                                </h2>
                            </div>
                            <Link
                                href={admin.finances().url}
                                className="text-xs font-semibold text-primary hover:underline"
                            >
                                Full Audit Trail →
                            </Link>
                        </div>

                        {recentAuditLogs.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No hub audit events recorded yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {recentAuditLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 text-xs"
                                    >
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {log.event && (
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-[10px]"
                                                    >
                                                        {log.event}
                                                    </Badge>
                                                )}
                                                <span className="font-medium text-foreground">
                                                    {log.description}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground">
                                                By: <strong>{log.causer?.name ?? 'System'}</strong>
                                                {log.subject_type
                                                    ? ` • ${log.subject_type} #${log.subject_id}`
                                                    : ''}
                                            </p>
                                        </div>
                                        {log.created_at && (
                                            <span
                                                suppressHydrationWarning
                                                className="text-[11px] text-muted-foreground shrink-0"
                                            >
                                                {new Date(log.created_at).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 lg:col-span-4">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                            <h2 className="text-sm font-bold text-foreground">
                                Administration Shortcuts
                            </h2>
                            <div className="space-y-2">
                                <Link
                                    href={admin.shiftAudits().url}
                                    className="flex items-center justify-between rounded-xl border border-border/70 p-3 text-xs font-medium hover:bg-muted/40 transition"
                                >
                                    <span className="flex items-center gap-2">
                                        <Calculator className="size-4 text-primary" />
                                        Review Shift Drawer Audits
                                    </span>
                                    <ArrowRight className="size-3.5 text-muted-foreground" />
                                </Link>
                                <Link
                                    href={admin.staff.index().url}
                                    className="flex items-center justify-between rounded-xl border border-border/70 p-3 text-xs font-medium hover:bg-muted/40 transition"
                                >
                                    <span className="flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-primary" />
                                        Manage Staff & Permissions
                                    </span>
                                    <ArrowRight className="size-3.5 text-muted-foreground" />
                                </Link>
                                <Link
                                    href={admin.reports.index().url}
                                    className="flex items-center justify-between rounded-xl border border-border/70 p-3 text-xs font-medium hover:bg-muted/40 transition"
                                >
                                    <span className="flex items-center gap-2">
                                        <Flag className="size-4 text-primary" />
                                        Resolve User Reports
                                    </span>
                                    <ArrowRight className="size-3.5 text-muted-foreground" />
                                </Link>
                                <Link
                                    href={admin.settings().url}
                                    className="flex items-center justify-between rounded-xl border border-border/70 p-3 text-xs font-medium hover:bg-muted/40 transition"
                                >
                                    <span className="flex items-center gap-2">
                                        <Settings className="size-4 text-primary" />
                                        Configure System Timers
                                    </span>
                                    <ArrowRight className="size-3.5 text-muted-foreground" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
