import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Calculator,
    CheckCircle2,
    Clock,
    QrCode,
    Smartphone,
    User,
    Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InPageNav } from '@/components/ui/in-page-nav';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import staff from '@/routes/staff';

interface PendingPayoutItem {
    id: number;
    quantity: number;
    price: string;
    total_amount: string;
    item: {
        id: number;
        title: string;
        shelf_location: string | null;
    } | null;
    seller: {
        id: number;
        name: string;
        email: string;
        ewallet_provider: string | null;
        ewallet_account_name: string | null;
        ewallet_account_number: string | null;
        has_ewallet_qr: boolean;
        ewallet_qr_url: string | null;
    } | null;
    order: {
        id: number;
        completed_at: string | null;
    } | null;
}

interface HeldCashPayoutItem {
    id: number;
    quantity: number;
    price: string;
    total_amount: string;
    payout_hold_reason: string | null;
    payout_hold_reason_label: string | null;
    payout_note: string | null;
    item: {
        id: number;
        title: string;
        shelf_location: string | null;
    } | null;
    seller: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface RecentDisbursementItem {
    id: number;
    quantity: number;
    price: string;
    total_amount: string;
    payout_status: string;
    paid_at: string | null;
    paid_by: { id: number; name: string } | null;
    item: { id: number; title: string } | null;
    seller: { id: number; name: string } | null;
}

interface HoldReasonOption {
    value: string;
    label: string;
}

interface StaffPayoutsProps {
    pendingPayouts: PendingPayoutItem[];
    heldCashPayouts: HeldCashPayoutItem[];
    recentDisbursements: RecentDisbursementItem[];
    hasOpenShift?: boolean;
    holdReasons?: HoldReasonOption[];
}

function formatPeso(amount: string | number): string {
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function Payouts({
    pendingPayouts = [],
    heldCashPayouts = [],
    recentDisbursements = [],
    hasOpenShift = false,
    holdReasons = [],
}: StaffPayoutsProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'held' | 'recent'>('pending');

    // Pending dual-payout drawer state
    const [selectedPending, setSelectedPending] = useState<PendingPayoutItem | null>(null);
    const [pendingDrawerOpen, setPendingDrawerOpen] = useState(false);
    const [payoutMethod, setPayoutMethod] = useState<'digital' | 'cash_hold'>('digital');
    const [holdReason, setHoldReason] = useState<string>('insufficient_digital_funds');
    const [holdNote, setHoldNote] = useState('');

    // Held cash release drawer state
    const [selectedHeld, setSelectedHeld] = useState<HeldCashPayoutItem | null>(null);
    const [heldDrawerOpen, setHeldDrawerOpen] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const openDualPayoutDrawer = (item: PendingPayoutItem) => {
        setSelectedPending(item);
        setPayoutMethod(item.seller?.has_ewallet_qr ? 'digital' : 'cash_hold');
        setHoldReason(
            item.seller?.has_ewallet_qr ? 'insufficient_digital_funds' : 'unreadable_qr',
        );
        setHoldNote('');
        setPendingDrawerOpen(true);
    };

    const handleDisburseDigital = () => {
        if (!selectedPending) return;
        setSubmitting(true);
        router.post(
            staff.payouts.digital({ orderItem: selectedPending.id }).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `Digital payout of ${formatPeso(selectedPending.total_amount)} recorded and seller notified!`,
                    );
                    setPendingDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to disburse digital payout.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const handleHoldForCash = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPending) return;
        setSubmitting(true);
        router.post(
            staff.payouts.hold({ orderItem: selectedPending.id }).url,
            {
                reason: holdReason || null,
                note: holdNote.trim() || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Payout held for physical cash pickup & seller notified.');
                    setPendingDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to hold payout for cash.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const handleReleaseCash = () => {
        if (!selectedHeld) return;
        setSubmitting(true);
        router.post(
            staff.payouts.release({ orderItem: selectedHeld.id }).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `Released ${formatPeso(selectedHeld.total_amount)} cash to ${selectedHeld.seller?.name ?? 'seller'}.`,
                    );
                    setHeldDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Could not release cash payout.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <>
            <Head title="Dual Payouts - UniMart Staff" />

            <PageContainer>
                <PageHeader
                    icon={Banknote}
                    title="Dual-Payout Desk"
                    description="Disburse sold item earnings digitally via seller E-Wallet QR, or hold physical cash for desk claim."
                />

                {!hasOpenShift && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <div>
                                <p className="font-semibold">Shift Drawer Not Open</p>
                                <p className="mt-0.5 opacity-90">
                                    Open an active shift before releasing physical cash payouts so drawer deductions are accurately audited.
                                </p>
                            </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="bg-background gap-1.5 shrink-0 text-xs">
                            <Link href={staff.drawerCount().url}>
                                <Calculator className="size-3.5" />
                                Open Shift
                            </Link>
                        </Button>
                    </div>
                )}

                <InPageNav
                    ariaLabel="Staff payouts navigation"
                    items={[
                        {
                            title: 'Pending Disbursement',
                            icon: Clock,
                            badge: pendingPayouts.length,
                            isActive: activeTab === 'pending',
                            onClick: () => setActiveTab('pending'),
                        },
                        {
                            title: 'Held for Cash Claim',
                            icon: Wallet,
                            badge: heldCashPayouts.length,
                            isActive: activeTab === 'held',
                            onClick: () => setActiveTab('held'),
                        },
                        {
                            title: 'Recent Disbursements',
                            icon: CheckCircle2,
                            badge: recentDisbursements.length,
                            isActive: activeTab === 'recent',
                            onClick: () => setActiveTab('recent'),
                        },
                    ]}
                />

                {/* Tab 1: Pending Payouts */}
                {activeTab === 'pending' &&
                    (pendingPayouts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                            <Banknote className="size-8 text-muted-foreground opacity-40" />
                            <h3 className="mt-3 font-semibold text-foreground">
                                No pending payouts
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                All recently completed sales have been paid digitally or marked for cash claim.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                            {pendingPayouts.map((payout) => (
                                <div
                                    key={payout.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                {payout.item?.title ?? `Order Item #${payout.id}`}
                                            </span>
                                            {payout.seller?.has_ewallet_qr ? (
                                                <Badge
                                                    variant="outline"
                                                    className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]"
                                                >
                                                    <QrCode className="size-3" />
                                                    E-Wallet QR Ready
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    No QR Saved (Cash Only)
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <User className="size-3" />
                                                Seller: {payout.seller?.name ?? 'Unknown'}
                                            </span>
                                            <span>
                                                Qty {payout.quantity} × {formatPeso(payout.price)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                        <span className="text-base font-extrabold text-foreground">
                                            {formatPeso(payout.total_amount)}
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => openDualPayoutDrawer(payout)}
                                            className="text-xs"
                                        >
                                            Process Payout
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                {/* Tab 2: Held for Cash Claim */}
                {activeTab === 'held' &&
                    (heldCashPayouts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                            <Wallet className="size-8 text-muted-foreground opacity-40" />
                            <h3 className="mt-3 font-semibold text-foreground">
                                No held cash payouts
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Payouts marked &ldquo;Hold for Cash Claim&rdquo; will appear here until the seller collects cash at the desk.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                            {heldCashPayouts.map((held) => (
                                <div
                                    key={held.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                {held.item?.title ?? `Order Item #${held.id}`}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="border-ocean-teal/40 bg-ocean-teal/10 text-ocean-teal dark:text-seafoam-aqua text-[10px]"
                                            >
                                                Cash Held
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Seller: <strong>{held.seller?.name}</strong> (
                                            {held.seller?.email})
                                        </p>
                                        {held.payout_hold_reason_label && (
                                            <p className="text-xs text-muted-foreground">
                                                Reason: {held.payout_hold_reason_label}
                                                {held.payout_note ? ` — "${held.payout_note}"` : ''}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                        <span className="text-base font-extrabold text-foreground">
                                            {formatPeso(held.total_amount)}
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedHeld(held);
                                                setHeldDrawerOpen(true);
                                            }}
                                            className="text-xs"
                                        >
                                            Release Cash
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                {/* Tab 3: Recent Disbursements */}
                {activeTab === 'recent' &&
                    (recentDisbursements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                            <CheckCircle2 className="size-8 text-muted-foreground opacity-40" />
                            <h3 className="mt-3 font-semibold text-foreground">
                                No recent disbursements
                            </h3>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                            {recentDisbursements.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-xs"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                {entry.item?.title ?? `Order Item #${entry.id}`}
                                            </span>
                                            <Badge
                                                variant={
                                                    entry.payout_status === 'paid_digitally'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className={
                                                    entry.payout_status === 'paid_digitally'
                                                        ? 'bg-emerald-600 text-white text-[10px]'
                                                        : 'text-[10px]'
                                                }
                                            >
                                                {entry.payout_status === 'paid_digitally'
                                                    ? 'Paid Digitally'
                                                    : 'Cash Claimed'}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground">
                                            Seller: {entry.seller?.name ?? '—'} • Processed by:{' '}
                                            {entry.paid_by?.name ?? '—'}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <span className="text-base font-extrabold text-foreground block">
                                            {formatPeso(entry.total_amount)}
                                        </span>
                                        {entry.paid_at && (
                                            <span className="text-[11px] text-muted-foreground">
                                                {new Date(entry.paid_at).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
            </PageContainer>

            {/* Dual-Payout Action Drawer */}
            <SlidingDrawer open={pendingDrawerOpen} onOpenChange={setPendingDrawerOpen}>
                <SlidingDrawerContent maxHeight="90vh" desktopWidth="xl">
                    {selectedPending && (
                        <>
                            <SlidingDrawerHeader
                                icon={Banknote}
                                title="Dual-Payout Disbursement"
                                description="Send funds digitally via the seller's e-wallet QR or hold physical cash at the desk."
                            />

                            <div className="mt-4 space-y-5">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-foreground">
                                            {selectedPending.item?.title ?? 'Sold Item'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Seller: <strong>{selectedPending.seller?.name}</strong> (
                                            {selectedPending.seller?.email})
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                                            Exact Payout
                                        </span>
                                        <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                            {formatPeso(selectedPending.total_amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Method Selector */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant={payoutMethod === 'digital' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPayoutMethod('digital')}
                                        className="gap-1.5 text-xs"
                                    >
                                        <Smartphone className="size-3.5" />
                                        Digital E-Wallet
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={
                                            payoutMethod === 'cash_hold' ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setPayoutMethod('cash_hold')}
                                        className="gap-1.5 text-xs"
                                    >
                                        <Wallet className="size-3.5" />
                                        Hold for Cash Claim
                                    </Button>
                                </div>

                                {payoutMethod === 'digital' ? (
                                    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                                        {selectedPending.seller?.has_ewallet_qr &&
                                        selectedPending.seller.ewallet_qr_url ? (
                                            <div className="flex flex-col items-center text-center space-y-3">
                                                <div className="size-56 rounded-2xl border-2 border-neutral-200 bg-white p-3 shadow-xs">
                                                    <img
                                                        src={selectedPending.seller.ewallet_qr_url}
                                                        alt="Seller E-Wallet QR"
                                                        className="size-full object-contain"
                                                    />
                                                </div>
                                                <div className="space-y-0.5 text-xs">
                                                    {selectedPending.seller.ewallet_provider && (
                                                        <Badge variant="secondary" className="uppercase">
                                                            {selectedPending.seller.ewallet_provider}
                                                        </Badge>
                                                    )}
                                                    {selectedPending.seller.ewallet_account_name && (
                                                        <p className="font-semibold text-foreground">
                                                            {
                                                                selectedPending.seller
                                                                    .ewallet_account_name
                                                            }
                                                        </p>
                                                    )}
                                                    {selectedPending.seller
                                                        .ewallet_account_number && (
                                                        <p className="font-mono text-muted-foreground">
                                                            {
                                                                selectedPending.seller
                                                                    .ewallet_account_number
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground max-w-sm">
                                                    Scan this QR using the Hub e-wallet device, send{' '}
                                                    <strong>
                                                        {formatPeso(selectedPending.total_amount)}
                                                    </strong>
                                                    , then confirm below.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                                                <p className="font-semibold">
                                                    Seller has not uploaded an E-Wallet QR code.
                                                </p>
                                                <p>
                                                    Switch to &ldquo;Hold for Cash Claim&rdquo; to notify the seller to collect physical cash at the Hub desk.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-2">
                                            <SlidingDrawerClose asChild>
                                                <Button type="button" variant="outline" size="sm">
                                                    Cancel
                                                </Button>
                                            </SlidingDrawerClose>
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={
                                                    submitting ||
                                                    !selectedPending.seller?.has_ewallet_qr
                                                }
                                                onClick={handleDisburseDigital}
                                                className="gap-1.5"
                                            >
                                                <CheckCircle2 className="size-4" />
                                                {submitting
                                                    ? 'Recording...'
                                                    : 'Confirm Digital Transfer Sent'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={handleHoldForCash}
                                        className="space-y-4 rounded-xl border border-border bg-card p-4"
                                    >
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="payout_hold_reason"
                                                className="text-xs font-semibold"
                                            >
                                                Hold Reason
                                            </Label>
                                            <NativeSelect
                                                id="payout_hold_reason"
                                                value={holdReason}
                                                onChange={(e) => setHoldReason(e.target.value)}
                                            >
                                                {holdReasons.map((r) => (
                                                    <option key={r.value} value={r.value}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="payout_hold_note"
                                                className="text-xs font-semibold"
                                            >
                                                Optional Note for Seller
                                            </Label>
                                            <Textarea
                                                id="payout_hold_note"
                                                rows={3}
                                                value={holdNote}
                                                onChange={(e) => setHoldNote(e.target.value)}
                                                placeholder="e.g. Please visit Hub Room 204 between 9AM–4PM with your Student ID."
                                                maxLength={500}
                                                className="bg-background"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1">
                                            <SlidingDrawerClose asChild>
                                                <Button type="button" variant="outline" size="sm">
                                                    Cancel
                                                </Button>
                                            </SlidingDrawerClose>
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={submitting}
                                                className="gap-1.5"
                                            >
                                                <Wallet className="size-4" />
                                                {submitting
                                                    ? 'Saving...'
                                                    : 'Hold for Cash Claim & Notify Seller'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>

            {/* Release Held Cash Drawer */}
            <SlidingDrawer open={heldDrawerOpen} onOpenChange={setHeldDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {selectedHeld && (
                        <>
                            <SlidingDrawerHeader
                                icon={Wallet}
                                title="Release Physical Cash Payout"
                                description="Verify the seller's Student ID and disburse cash from your active desk drawer."
                            />

                            <div className="mt-4 space-y-4">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                                    <p className="font-bold text-foreground">
                                        {selectedHeld.item?.title ?? 'Sold Item'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Seller: <strong>{selectedHeld.seller?.name}</strong> (
                                        {selectedHeld.seller?.email})
                                    </p>
                                    <p className="text-2xl font-extrabold text-ocean-teal dark:text-seafoam-aqua pt-1">
                                        {formatPeso(selectedHeld.total_amount)}
                                    </p>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Releasing this cash payout will deduct{' '}
                                    <strong>{formatPeso(selectedHeld.total_amount)}</strong> from your current shift&apos;s expected drawer balance.
                                </p>

                                {!hasOpenShift && (
                                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-300">
                                        You must open a shift before releasing physical cash.
                                    </div>
                                )}
                            </div>

                            <SlidingDrawerFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                <SlidingDrawerClose asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        Cancel
                                    </Button>
                                </SlidingDrawerClose>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={submitting || !hasOpenShift}
                                    onClick={handleReleaseCash}
                                    className="gap-1.5"
                                >
                                    <CheckCircle2 className="size-4" />
                                    {submitting
                                        ? 'Releasing...'
                                        : `Confirm Cash Released (${formatPeso(selectedHeld.total_amount)})`}
                                </Button>
                            </SlidingDrawerFooter>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>
        </>
    );
}

Payouts.layout = {
    breadcrumbs: [
        {
            title: 'Payouts',
            href: staff.payouts().url,
        },
    ],
};
