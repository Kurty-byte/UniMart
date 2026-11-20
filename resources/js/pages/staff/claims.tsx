import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calculator,
    CheckCircle2,
    Clock,
    MapPin,
    PackageCheck,
    QrCode,
    User,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { useCountdown } from '@/hooks/use-countdown';
import staff from '@/routes/staff';
import type { PaginatedData } from '@/types/admin';

interface PendingClaimOrder {
    id: number;
    claim_qr_code: string | null;
    total_price: string;
    expires_at: string | null;
    buyer: {
        id: number;
        name: string;
        email: string;
    };
    items: {
        id: number;
        quantity: number;
        price: string;
        item: {
            id: number;
            title: string;
            shelf_location: string | null;
            dropoff_qr_code: string;
        } | null;
    }[];
    created_at: string | null;
}

interface StaffClaimsProps {
    pendingClaims: PaginatedData<PendingClaimOrder>;
    hasOpenShift?: boolean;
}

function formatPeso(amount: string | number): string {
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function ExpiryChip({ expiresAt }: { expiresAt: string | null }) {
    const countdown = useCountdown(expiresAt);
    if (!expiresAt) return null;
    if (countdown.isExpired) {
        return (
            <Badge variant="destructive" className="text-[10px]">
                Expired
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="gap-1 font-mono text-[10px]">
            <Clock className="size-3" />
            {countdown.formatted}
        </Badge>
    );
}

export default function Claims({ pendingClaims, hasOpenShift = false }: StaffClaimsProps) {
    const [selectedOrder, setSelectedOrder] = useState<PendingClaimOrder | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [completing, setCompleting] = useState(false);

    const handleCompleteHandover = () => {
        if (!selectedOrder) return;
        setCompleting(true);
        router.post(
            staff.claims.complete({ order: selectedOrder.id }).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `Order #${selectedOrder.id} completed! Cash recorded in shift drawer.`,
                    );
                    setDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Could not complete order handover.');
                },
                onFinish: () => setCompleting(false),
            },
        );
    };

    return (
        <>
            <Head title="Buyer Claims - UniMart Staff" />

            <PageContainer>
                <PageHeader
                    icon={PackageCheck}
                    title="Buyer Claims (Hard Holds)"
                    description="Verify buyer Claim QR codes, collect physical cash, and hand over shelved items."
                    actions={
                        <Button asChild size="sm" className="gap-1.5">
                            <Link href={staff.scan().url}>
                                <QrCode className="size-4" />
                                Scan Claim QR
                            </Link>
                        </Button>
                    }
                />

                {!hasOpenShift && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <div>
                                <p className="font-semibold">Shift Drawer Closed</p>
                                <p className="mt-0.5 opacity-90">
                                    Open a desk shift with your opening cash float before accepting cash payments for buyer claims.
                                </p>
                            </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="shrink-0 bg-background gap-1.5 text-xs">
                            <Link href={staff.drawerCount().url}>
                                <Calculator className="size-3.5" />
                                Open Shift
                            </Link>
                        </Button>
                    </div>
                )}

                {pendingClaims.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <PackageCheck className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No pending buyer claims</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Active 24-hour Hard Hold reservations awaiting campus pickup will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {pendingClaims.data.map((order) => (
                            <div
                                key={order.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition"
                            >
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-sm text-foreground">
                                            Order #{order.id}
                                        </span>
                                        <ExpiryChip expiresAt={order.expires_at} />
                                        {order.claim_qr_code && (
                                            <span className="font-mono text-[11px] text-muted-foreground">
                                                {order.claim_qr_code}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <User className="size-3" />
                                            {order.buyer.name} ({order.buyer.email})
                                        </span>
                                        <span>
                                            {order.items.length}{' '}
                                            {order.items.length === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {order.items.map((oi) => (
                                            <Badge
                                                key={oi.id}
                                                variant="secondary"
                                                className="text-[10px] gap-1"
                                            >
                                                <MapPin className="size-2.5" />
                                                {oi.item?.shelf_location ?? 'No Shelf'} •{' '}
                                                {oi.item?.title ?? 'Item'} (×{oi.quantity})
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                                            Cash Due
                                        </span>
                                        <span className="text-base font-extrabold text-foreground">
                                            {formatPeso(order.total_price)}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setDrawerOpen(true);
                                        }}
                                        className="text-xs"
                                    >
                                        Process Handover
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pendingClaims.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {pendingClaims.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={pendingClaims.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {pendingClaims.current_page} of {pendingClaims.last_page}
                        </span>
                        {pendingClaims.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={pendingClaims.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            {/* Claim Handover Drawer */}
            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="90vh" desktopWidth="xl">
                    {selectedOrder && (
                        <>
                            <SlidingDrawerHeader
                                icon={PackageCheck}
                                title={`Complete Handover — Order #${selectedOrder.id}`}
                                description="Pull all listed items from the shelves, accept exact physical cash, and mark sold."
                            />

                            <div className="mt-4 space-y-4">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {selectedOrder.buyer.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedOrder.buyer.email}
                                        </p>
                                        {selectedOrder.claim_qr_code && (
                                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                                                QR: {selectedOrder.claim_qr_code}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
                                            Cash to Collect
                                        </span>
                                        <span className="text-2xl font-extrabold text-ocean-teal dark:text-seafoam-aqua">
                                            {formatPeso(selectedOrder.total_price)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Shelf Pick List
                                    </h4>
                                    <div className="divide-y rounded-xl border border-border bg-card">
                                        {selectedOrder.items.map((oi) => (
                                            <div
                                                key={oi.id}
                                                className="flex items-center justify-between gap-3 p-3 text-xs"
                                            >
                                                <div className="min-w-0 space-y-1">
                                                    <p className="font-semibold text-foreground">
                                                        {oi.item?.title ?? 'Consigned Item'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <span>
                                                            Qty {oi.quantity} × {formatPeso(oi.price)}
                                                        </span>
                                                        {oi.item?.shelf_location && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="gap-1 text-[10px]"
                                                            >
                                                                <MapPin className="size-3" />
                                                                {oi.item.shelf_location}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-bold text-foreground">
                                                    {formatPeso(Number(oi.price) * oi.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {!hasOpenShift && (
                                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-300">
                                        You must open a shift on the Drawer Count page before completing cash handovers.
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
                                    disabled={completing || !hasOpenShift}
                                    onClick={handleCompleteHandover}
                                    className="gap-1.5"
                                >
                                    <CheckCircle2 className="size-4" />
                                    {completing
                                        ? 'Recording Sale...'
                                        : `Confirm Cash (${formatPeso(selectedOrder.total_price)}) & Complete`}
                                </Button>
                            </SlidingDrawerFooter>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>
        </>
    );
}

Claims.layout = {
    breadcrumbs: [
        {
            title: 'Claims',
            href: staff.claims().url,
        },
    ],
};
