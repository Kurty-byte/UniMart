import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    Building2,
    CheckCircle2,
    Clock,
    QrCode,
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
import { edit as editPayout } from '@/routes/payout';
import student from '@/routes/student';
import type { PaginatedData } from '@/types/admin';

interface PayoutRecord {
    id: number;
    quantity: number;
    price: string;
    total_amount: string;
    payout_status: string;
    payout_hold_reason: string | null;
    payout_hold_reason_label: string | null;
    payout_note: string | null;
    paid_at: string | null;
    paid_by: {
        id: number;
        name: string;
    } | null;
    item: {
        id: number;
        title: string;
    } | null;
    created_at: string | null;
}

interface StudentPayoutsProps {
    summary: {
        totalPaid: string;
        readyForPickup: string;
        pendingProcessing: string;
    };
    payouts: PaginatedData<PayoutRecord>;
    hasEwalletQr: boolean;
}

const statusMap: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
    pending: {
        label: 'Pending Processing',
        variant: 'outline',
        className: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    paid_digitally: {
        label: 'Paid Digitally',
        variant: 'default',
        className: 'bg-emerald-600 text-white',
    },
    cash_held: {
        label: 'Ready for Cash Pickup',
        variant: 'outline',
        className: 'border-ocean-teal/40 bg-ocean-teal/10 text-ocean-teal dark:text-seafoam-aqua',
    },
    cash_claimed: {
        label: 'Cash Claimed',
        variant: 'secondary',
    },
};

function formatPeso(amount: string | number): string {
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function StudentPayouts({
    summary,
    payouts,
    hasEwalletQr,
}: StudentPayoutsProps) {
    const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const hasCashReady = Number(summary.readyForPickup) > 0;

    return (
        <>
            <Head title="My Payouts - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={Banknote}
                    title="Seller Payouts"
                    description="Monitor digital e-wallet disbursements and physical cash ready for pickup at the Campus Hub."
                    actions={
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={editPayout().url}>
                                <QrCode className="size-4" />
                                {hasEwalletQr ? 'Manage E-Wallet QR' : 'Upload E-Wallet QR'}
                            </Link>
                        </Button>
                    }
                />

                {/* Alerts */}
                {!hasEwalletQr && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300">
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <div>
                                <p className="font-semibold">No E-Wallet QR Saved</p>
                                <p className="mt-0.5 opacity-90">
                                    Upload your static GCash or Maya QR code once so Hub Staff can send earnings digitally as soon as your items sell.
                                </p>
                            </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="shrink-0 bg-background text-xs">
                            <Link href={editPayout().url}>Set Up E-Wallet</Link>
                        </Button>
                    </div>
                )}

                {hasCashReady && (
                    <div className="flex items-start gap-3 rounded-2xl border border-ocean-teal/40 bg-ocean-teal/10 p-4 text-xs text-foreground">
                        <Building2 className="mt-0.5 size-5 shrink-0 text-ocean-teal dark:text-seafoam-aqua" />
                        <div>
                            <p className="font-bold text-sm">
                                You have {formatPeso(summary.readyForPickup)} in physical cash ready for pickup!
                            </p>
                            <p className="mt-0.5 text-muted-foreground">
                                Visit the Campus Hub desk with your student ID to claim your held cash payout from an authorized Staff operator.
                            </p>
                        </div>
                    </div>
                )}

                {/* Summary KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Total Paid Out
                            </span>
                            <CheckCircle2 className="size-4 text-emerald-600" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground">
                            {formatPeso(summary.totalPaid)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Digital transfers & claimed cash
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Cash Ready at Hub
                            </span>
                            <Wallet className="size-4 text-ocean-teal" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-ocean-teal dark:text-seafoam-aqua">
                            {formatPeso(summary.readyForPickup)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Waiting for your desk pickup
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Pending Processing
                            </span>
                            <Clock className="size-4 text-amber-600" />
                        </div>
                        <p className="mt-2 text-2xl font-extrabold text-foreground">
                            {formatPeso(summary.pendingProcessing)}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Sold items awaiting staff disbursement
                        </p>
                    </div>
                </div>

                {/* Payout Ledger */}
                {payouts.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Banknote className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No payouts yet</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Your payout disbursements will appear here once buyers complete purchase of your listings.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {payouts.data.map((payout) => {
                            const statusInfo = statusMap[payout.payout_status] ?? {
                                label: payout.payout_status,
                                variant: 'outline' as const,
                            };
                            return (
                                <button
                                    key={payout.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPayout(payout);
                                        setDrawerOpen(true);
                                    }}
                                    className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-left transition hover:bg-muted/40 cursor-pointer"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                {payout.item?.title ?? `Order Item #${payout.id}`}
                                            </span>
                                            <Badge
                                                variant={statusInfo.variant}
                                                className={`text-[10px] ${statusInfo.className || ''}`}
                                            >
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Qty {payout.quantity} × {formatPeso(payout.price)}
                                            {payout.payout_hold_reason_label
                                                ? ` • ${payout.payout_hold_reason_label}`
                                                : ''}
                                        </p>
                                    </div>

                                    <div className="text-left sm:text-right shrink-0">
                                        <span className="text-base font-extrabold text-foreground block">
                                            {formatPeso(payout.total_amount)}
                                        </span>
                                        {payout.paid_at && (
                                            <span className="text-[11px] text-muted-foreground">
                                                Paid {new Date(payout.paid_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {payouts.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        {payouts.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={payouts.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {payouts.current_page} of {payouts.last_page}
                        </span>
                        {payouts.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={payouts.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            {/* Payout Detail Drawer */}
            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {selectedPayout && (
                        <>
                            <SlidingDrawerHeader
                                icon={Banknote}
                                title={`Payout #${selectedPayout.id}`}
                                description="Disbursement breakdown and Hub processing details."
                            />

                            <div className="mt-4 space-y-4">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                                    <p className="font-bold text-foreground">
                                        {selectedPayout.item?.title ?? 'Sold Item'}
                                    </p>
                                    <p className="text-2xl font-extrabold text-foreground">
                                        {formatPeso(selectedPayout.total_amount)}
                                    </p>
                                    <Badge
                                        variant={
                                            statusMap[selectedPayout.payout_status]?.variant ??
                                            'outline'
                                        }
                                        className={
                                            statusMap[selectedPayout.payout_status]?.className
                                        }
                                    >
                                        {statusMap[selectedPayout.payout_status]?.label ??
                                            selectedPayout.payout_status}
                                    </Badge>
                                </div>

                                {selectedPayout.payout_status === 'cash_held' && (
                                    <div className="rounded-xl border border-ocean-teal/30 bg-ocean-teal/10 p-3.5 text-xs space-y-1">
                                        <p className="font-semibold text-foreground">
                                            Cash Ready for Pickup at Campus Hub
                                        </p>
                                        {selectedPayout.payout_hold_reason_label && (
                                            <p className="text-muted-foreground">
                                                Reason: {selectedPayout.payout_hold_reason_label}
                                            </p>
                                        )}
                                        {selectedPayout.payout_note && (
                                            <p className="text-muted-foreground">
                                                Staff Note: {selectedPayout.payout_note}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1.5 border-b border-border/50">
                                        <span className="text-muted-foreground">Processed By</span>
                                        <span className="font-medium text-foreground">
                                            {selectedPayout.paid_by?.name ?? 'Awaiting Staff'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5">
                                        <span className="text-muted-foreground">Disbursed At</span>
                                        <span className="font-medium text-foreground">
                                            {selectedPayout.paid_at
                                                ? new Date(selectedPayout.paid_at).toLocaleString()
                                                : 'Not yet disbursed'}
                                        </span>
                                    </div>
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

StudentPayouts.layout = {
    breadcrumbs: [
        {
            title: 'Payouts',
            href: student.payouts().url,
        },
    ],
};
