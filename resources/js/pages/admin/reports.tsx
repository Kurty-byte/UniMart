import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Ban,
    CheckCircle2,
    Flag,
    Package,
    User,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { PageContainer, PageHeader } from '@/components/page-layout';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import admin from '@/routes/admin';
import type { PaginatedData } from '@/types/admin';

interface AdminReport {
    id: number;
    reason: string;
    status: string;
    resolution_notes: string | null;
    resolved_at: string | null;
    reporter: { id: number; name: string; email: string } | null;
    reported_user: { id: number; name: string; email: string } | null;
    item: { id: number; title: string } | null;
    resolved_by: { id: number; name: string } | null;
    created_at: string | null;
}

interface AdminReportsProps {
    reports: PaginatedData<AdminReport>;
}

const statusMap: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
    pending: {
        label: 'Pending',
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

export default function Reports({ reports }: AdminReportsProps) {
    const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [suspendTarget, setSuspendTarget] = useState<{ id: number; name: string } | null>(null);
    const [suspending, setSuspending] = useState(false);

    const resolveForm = useForm({
        status: 'resolved',
        resolution_notes: '',
    });

    const openReport = (report: AdminReport) => {
        setSelectedReport(report);
        resolveForm.setData({
            status: 'resolved',
            resolution_notes: report.resolution_notes ?? '',
        });
        resolveForm.clearErrors();
        setDrawerOpen(true);
    };

    const handleResolve = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport) return;
        resolveForm.post(admin.reports.resolve({ report: selectedReport.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Report #${selectedReport.id} updated.`);
                setDrawerOpen(false);
            },
            onError: () => toast.error('Please enter resolution notes.'),
        });
    };

    const handleConfirmSuspend = () => {
        if (!suspendTarget) return;
        const { id, name } = suspendTarget;
        setSuspending(true);
        router.post(
            admin.users.suspend({ user: id }).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`User ${name} suspended.`);
                    setSuspendTarget(null);
                },
                onError: () => toast.error('Could not suspend user.'),
                onFinish: () => setSuspending(false),
            },
        );
    };

    return (
        <>
            <Head title="Reports & Disputes - UniMart Admin" />

            <PageContainer>
                <PageHeader
                    icon={Flag}
                    title="Flagged Users & Dispute Reports"
                    description="Review student-filed reports, take moderation action, and record official resolution notes."
                />

                {reports.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <Flag className="size-8 text-muted-foreground opacity-40" />
                        <h3 className="mt-3 font-semibold text-foreground">No reports submitted</h3>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {reports.data.map((report) => {
                            const status = statusMap[report.status] ?? {
                                label: report.status,
                                variant: 'outline' as const,
                            };

                            return (
                                <div
                                    key={report.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition"
                                >
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-sm text-foreground">
                                                Report #{report.id}
                                            </span>
                                            <Badge
                                                variant={status.variant}
                                                className={`text-[10px] ${status.className || ''}`}
                                            >
                                                {status.label}
                                            </Badge>
                                            {report.created_at && (
                                                <span className="text-[11px] text-muted-foreground">
                                                    {new Date(report.created_at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            {report.reporter && (
                                                <span>Reporter: {report.reporter.name}</span>
                                            )}
                                            {report.reported_user && (
                                                <span className="inline-flex items-center gap-1 text-foreground font-medium">
                                                    <User className="size-3" />
                                                    Flagged: {report.reported_user.name}
                                                </span>
                                            )}
                                            {report.item && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Package className="size-3" />
                                                    Item: {report.item.title}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground line-clamp-2">
                                            {report.reason}
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant={report.status === 'pending' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => openReport(report)}
                                        className="shrink-0 text-xs"
                                    >
                                        {report.status === 'pending' ? 'Review & Resolve' : 'View'}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {reports.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
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
                <SlidingDrawerContent maxHeight="90vh" desktopWidth="lg">
                    {selectedReport && (
                        <>
                            <SlidingDrawerHeader
                                icon={Flag}
                                title={`Dispute Report #${selectedReport.id}`}
                                description="Evaluate the reported concern and log an administrative decision."
                            />

                            <div className="mt-4 space-y-4 text-xs">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                                    {selectedReport.reporter && (
                                        <p>
                                            <span className="text-muted-foreground">Reporter: </span>
                                            <strong>{selectedReport.reporter.name}</strong> (
                                            {selectedReport.reporter.email})
                                        </p>
                                    )}
                                    {selectedReport.reported_user && (
                                        <div className="flex items-center justify-between gap-2">
                                            <p>
                                                <span className="text-muted-foreground">
                                                    Reported User:{' '}
                                                </span>
                                                <strong>{selectedReport.reported_user.name}</strong>
                                            </p>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="h-7 text-[11px] gap-1"
                                                onClick={() =>
                                                    setSuspendTarget({
                                                        id: selectedReport.reported_user!.id,
                                                        name: selectedReport.reported_user!.name,
                                                    })
                                                }
                                            >
                                                <Ban className="size-3" />
                                                Suspend User
                                            </Button>
                                        </div>
                                    )}
                                    {selectedReport.item && (
                                        <p>
                                            <span className="text-muted-foreground">Item: </span>
                                            <strong>{selectedReport.item.title}</strong>
                                        </p>
                                    )}
                                    <div className="border-t border-border/60 pt-2">
                                        <p className="font-semibold uppercase text-[10px] text-muted-foreground">
                                            Reason Filed
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-foreground">
                                            {selectedReport.reason}
                                        </p>
                                    </div>
                                </div>

                                {selectedReport.status === 'pending' ? (
                                    <form onSubmit={handleResolve} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={
                                                    resolveForm.data.status === 'resolved'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    resolveForm.setData('status', 'resolved')
                                                }
                                                className="gap-1.5 text-xs"
                                            >
                                                <CheckCircle2 className="size-3.5" />
                                                Mark Resolved
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={
                                                    resolveForm.data.status === 'dismissed'
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    resolveForm.setData('status', 'dismissed')
                                                }
                                                className="gap-1.5 text-xs"
                                            >
                                                <XCircle className="size-3.5" />
                                                Dismiss Report
                                            </Button>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="resolution_notes"
                                                className="text-xs font-semibold"
                                            >
                                                Resolution Notes *
                                            </Label>
                                            <Textarea
                                                id="resolution_notes"
                                                rows={3}
                                                value={resolveForm.data.resolution_notes}
                                                onChange={(e) =>
                                                    resolveForm.setData(
                                                        'resolution_notes',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Document the investigation outcome and any action taken..."
                                                required
                                                className="bg-background"
                                            />
                                            <InputError
                                                message={resolveForm.errors.resolution_notes}
                                            />
                                        </div>

                                        <SlidingDrawerFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                            <SlidingDrawerClose asChild>
                                                <Button type="button" variant="outline" size="sm">
                                                    Cancel
                                                </Button>
                                            </SlidingDrawerClose>
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={resolveForm.processing}
                                            >
                                                {resolveForm.processing
                                                    ? 'Saving...'
                                                    : 'Submit Decision'}
                                            </Button>
                                        </SlidingDrawerFooter>
                                    </form>
                                ) : (
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
                                        <p className="font-semibold text-foreground">
                                            Decision: {selectedReport.status.toUpperCase()}
                                        </p>
                                        <p className="text-foreground whitespace-pre-wrap">
                                            {selectedReport.resolution_notes}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground pt-1">
                                            By {selectedReport.resolved_by?.name ?? 'Admin'} on{' '}
                                            {selectedReport.resolved_at
                                                ? new Date(
                                                      selectedReport.resolved_at,
                                                  ).toLocaleString()
                                                : '—'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>

            <ConfirmActionDialog
                open={Boolean(suspendTarget)}
                onOpenChange={(val) => {
                    if (!val) setSuspendTarget(null);
                }}
                title={suspendTarget ? `Suspend ${suspendTarget.name}?` : 'Suspend user?'}
                description="This user will be immediately suspended and blocked from accessing UniMart."
                confirmLabel={suspending ? 'Suspending...' : 'Suspend User'}
                processing={suspending}
                onConfirm={handleConfirmSuspend}
            />
        </>
    );
}

Reports.layout = {
    breadcrumbs: [
        {
            title: 'Reports & Disputes',
            href: admin.reports.index().url,
        },
    ],
};
