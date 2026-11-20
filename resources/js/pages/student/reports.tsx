import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Flag,
    Package,
    User,
    XCircle,
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
import student from '@/routes/student';
import type { PaginatedData } from '@/types/admin';

interface StudentReport {
    id: number;
    reason: string;
    status: string;
    resolution_notes: string | null;
    resolved_at: string | null;
    created_at: string | null;
    item: {
        id: number;
        title: string;
    } | null;
    reported_user: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface StudentReportsProps {
    reports: PaginatedData<StudentReport>;
}

const statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
    pending: {
        label: 'Under Review',
        variant: 'outline',
        className: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    resolved: {
        label: 'Resolved',
        variant: 'default',
        className: 'bg-emerald-600 text-white',
    },
    dismissed: {
        label: 'Dismissed',
        variant: 'secondary',
    },
};

export default function StudentReports({ reports }: StudentReportsProps) {
    const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <Head title="My Reports & Disputes - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={Flag}
                    title="My Reports & Disputes"
                    description="Track the status of concerns and disputes you have reported to campus administration."
                />

                {reports.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Flag className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No reports filed</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            You can report inaccurate listings or concerning behavior directly from any catalog item&apos;s detail drawer.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {reports.data.map((report) => {
                            const status = statusConfig[report.status] ?? {
                                label: report.status,
                                variant: 'outline' as const,
                            };

                            return (
                                <button
                                    key={report.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setDrawerOpen(true);
                                    }}
                                    className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-left transition hover:bg-muted/40 cursor-pointer"
                                >
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                Report #{report.id}
                                            </span>
                                            <Badge
                                                variant={status.variant}
                                                className={`text-[10px] ${status.className || ''}`}
                                            >
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            {report.item && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Package className="size-3" />
                                                    Item: {report.item.title}
                                                </span>
                                            )}
                                            {report.reported_user && (
                                                <span className="inline-flex items-center gap-1">
                                                    <User className="size-3" />
                                                    User: {report.reported_user.name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground line-clamp-1">
                                            {report.reason}
                                        </p>
                                    </div>

                                    {report.created_at && (
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {reports.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        {reports.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={reports.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {reports.current_page} of {reports.last_page}
                        </span>
                        {reports.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={reports.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {selectedReport && (
                        <>
                            <SlidingDrawerHeader
                                icon={Flag}
                                title={`Report #${selectedReport.id}`}
                                description="Dispute details and administrative resolution status."
                            />

                            <div className="mt-4 space-y-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            statusConfig[selectedReport.status]?.variant ?? 'outline'
                                        }
                                        className={statusConfig[selectedReport.status]?.className}
                                    >
                                        {statusConfig[selectedReport.status]?.label ??
                                            selectedReport.status}
                                    </Badge>
                                    {selectedReport.created_at && (
                                        <span className="text-muted-foreground">
                                            Filed {new Date(selectedReport.created_at).toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
                                    {selectedReport.item && (
                                        <p>
                                            <span className="text-muted-foreground">Item: </span>
                                            <strong className="text-foreground">
                                                {selectedReport.item.title}
                                            </strong>
                                        </p>
                                    )}
                                    {selectedReport.reported_user && (
                                        <p>
                                            <span className="text-muted-foreground">
                                                Reported User:{' '}
                                            </span>
                                            <strong className="text-foreground">
                                                {selectedReport.reported_user.name}
                                            </strong>
                                        </p>
                                    )}
                                    <div className="pt-1 border-t border-border/60">
                                        <p className="text-[11px] uppercase font-semibold text-muted-foreground">
                                            Your Report
                                        </p>
                                        <p className="mt-1 text-foreground whitespace-pre-wrap">
                                            {selectedReport.reason}
                                        </p>
                                    </div>
                                </div>

                                {selectedReport.resolution_notes ? (
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1">
                                        <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                                            {selectedReport.status === 'resolved' ? (
                                                <CheckCircle2 className="size-4" />
                                            ) : (
                                                <XCircle className="size-4" />
                                            )}
                                            <span>Admin Resolution Notes</span>
                                        </div>
                                        <p className="text-foreground whitespace-pre-wrap">
                                            {selectedReport.resolution_notes}
                                        </p>
                                        {selectedReport.resolved_at && (
                                            <p className="text-[11px] text-muted-foreground pt-1">
                                                Updated{' '}
                                                {new Date(
                                                    selectedReport.resolved_at,
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-xl border border-border p-3 text-muted-foreground">
                                        <Clock className="size-4" />
                                        <span>
                                            Pending review by Campus Hub administrators.
                                        </span>
                                    </div>
                                )}
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

StudentReports.layout = {
    breadcrumbs: [
        {
            title: 'My Reports',
            href: student.reports.index().url,
        },
    ],
};
