import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Compass,
    Copy,
    Download,
    MapPin,
    Package,
    PackageCheck,
    Printer,
    QrCode,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InPageNav } from '@/components/ui/in-page-nav';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import { useClipboard } from '@/hooks/use-clipboard';
import { useCountdown } from '@/hooks/use-countdown';
import { formatPeso } from '@/lib/utils';
import student from '@/routes/student';

export interface ClaimOrderItem {
    id: number;
    title: string;
    price: string;
    quantity: number;
    image_url: string | null;
    shelf_location: string | null;
}

export interface ClaimOrder {
    id: number;
    status: string;
    total_price: string;
    claim_qr_code: string | null;
    claim_qr_code_svg?: string | null;
    expires_at: string | null;
    completed_at: string | null;
    created_at: string | null;
    items: ClaimOrderItem[];
}

interface StudentClaimsProps {
    activeClaims: ClaimOrder[];
    pastClaims: ClaimOrder[];
}

const statusBadgeMap: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
    pending_handover: {
        label: 'Ready for Pickup',
        variant: 'outline',
        className: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    completed: {
        label: 'Completed',
        variant: 'default',
        className: 'bg-emerald-600 text-white',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'secondary',
    },
    expired: {
        label: 'Expired',
        variant: 'destructive',
    },
};

function ClaimCountdownBadge({ expiresAt }: { expiresAt: string | null }) {
    const countdown = useCountdown(expiresAt);

    if (!expiresAt) {
        return null;
    }

    if (countdown.isExpired) {
        return (
            <Badge variant="destructive" className="gap-1 text-xs">
                <AlertTriangle className="size-3" />
                Hold Expired
            </Badge>
        );
    }

    const isUrgent = countdown.hours < 2;

    return (
        <Badge
            variant="outline"
            className={`gap-1 font-mono text-xs tabular-nums ${
                isUrgent
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                    : 'border-ocean-teal/40 bg-ocean-teal/10 text-ocean-teal-700 dark:text-seafoam-aqua'
            }`}
        >
            <Clock className="size-3" aria-hidden="true" />
            {countdown.formatted} left
        </Badge>
    );
}

export default function StudentClaims({
    activeClaims = [],
    pastClaims = [],
}: StudentClaimsProps) {
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
    const [selectedOrder, setSelectedOrder] = useState<ClaimOrder | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [cancelConfirmOrder, setCancelConfirmOrder] = useState<ClaimOrder | null>(null);
    const [copiedText, copy] = useClipboard();

    const displayedOrders = activeTab === 'active' ? activeClaims : pastClaims;

    const handleOpenOrder = (order: ClaimOrder) => {
        setSelectedOrder(order);
        setDrawerOpen(true);
    };

    const handleDownloadSvg = (order: ClaimOrder) => {
        if (!order.claim_qr_code_svg || !order.claim_qr_code) {
            return;
        }
        const blob = new Blob([order.claim_qr_code_svg], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `unimart-claim-${order.claim_qr_code}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleConfirmCancelOrder = () => {
        if (!cancelConfirmOrder) return;
        const order = cancelConfirmOrder;

        setCancellingId(order.id);
        router.delete(student.claims.cancel({ order: order.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reservation cancelled and items released back to catalog.');
                setCancelConfirmOrder(null);
                setDrawerOpen(false);
                setSelectedOrder(null);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] as string | undefined;
                toast.error(msg || 'Could not cancel this reservation.');
            },
            onFinish: () => setCancellingId(null),
        });
    };

    return (
        <>
            <Head title="My Pickups & Claim QR - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={PackageCheck}
                    title="My Pickups & Claims"
                    description="Present your Claim QR code and pay cash at the Campus Hub desk before your Hard Hold timer expires."
                    actions={
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={student.browse().url}>
                                <Compass className="size-4" />
                                Browse Catalog
                            </Link>
                        </Button>
                    }
                />

                {/* Tabs */}
                <InPageNav
                    ariaLabel="Pickup orders navigation"
                    items={[
                        {
                            title: 'Active Pickups',
                            icon: QrCode,
                            badge: activeClaims.length,
                            isActive: activeTab === 'active',
                            onClick: () => setActiveTab('active'),
                        },
                        {
                            title: 'Order History',
                            icon: Calendar,
                            badge: pastClaims.length,
                            isActive: activeTab === 'past',
                            onClick: () => setActiveTab('past'),
                        },
                    ]}
                />

                {/* Orders List */}
                {displayedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <PackageCheck className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">
                            {activeTab === 'active'
                                ? 'No active hub pickups'
                                : 'No past pickup orders yet'}
                        </h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            {activeTab === 'active'
                                ? 'Add items to your cart and commit to buy to receive a 24-hour Claim QR code.'
                                : 'Your completed, cancelled, and expired orders will appear here.'}
                        </p>
                        {activeTab === 'active' && (
                            <Button asChild size="sm" className="mt-5 gap-1.5">
                                <Link href={student.browse().url}>
                                    <Compass className="size-4" />
                                    Explore Marketplace
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {displayedOrders.map((order) => {
                            const statusInfo = statusBadgeMap[order.status] ?? {
                                label: order.status,
                                variant: 'outline' as const,
                            };

                            return (
                                <div
                                    key={order.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md"
                                >
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground text-base">
                                                        Order #{order.id}
                                                    </span>
                                                    <Badge
                                                        variant={statusInfo.variant}
                                                        className={`text-[11px] ${statusInfo.className || ''}`}
                                                    >
                                                        {statusInfo.label}
                                                    </Badge>
                                                </div>
                                                {order.created_at && (
                                                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                                                        Reserved on{' '}
                                                        {new Date(order.created_at).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            {order.status === 'pending_handover' && (
                                                <ClaimCountdownBadge expiresAt={order.expires_at} />
                                            )}
                                        </div>

                                        {/* Items Preview */}
                                        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
                                            {order.items.map((oi) => (
                                                <div
                                                    key={oi.id}
                                                    className="flex items-center justify-between gap-3 text-xs"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                                            {oi.image_url ? (
                                                                <img
                                                                    src={oi.image_url}
                                                                    alt={oi.title}
                                                                    loading="lazy"
                                                                    decoding="async"
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                                                    <Package className="size-4 opacity-40" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-foreground">
                                                                {oi.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                <span>
                                                                    {oi.quantity} × {formatPeso(oi.price)}
                                                                </span>
                                                                {oi.shelf_location && (
                                                                    <span className="inline-flex items-center gap-0.5 text-ocean-teal dark:text-seafoam-aqua font-medium">
                                                                        <MapPin className="size-3" />
                                                                        {oi.shelf_location}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="font-semibold text-foreground shrink-0">
                                                        {formatPeso(Number(oi.price) * oi.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                                        <div>
                                            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
                                                Cash Due at Hub
                                            </span>
                                            <span className="text-lg font-extrabold text-foreground tabular-nums">
                                                {formatPeso(order.total_price)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {order.status === 'pending_handover' ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => handleOpenOrder(order)}
                                                    className="gap-1.5 text-xs"
                                                >
                                                    <QrCode className="size-3.5" />
                                                    Present Claim QR
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenOrder(order)}
                                                    className="text-xs"
                                                >
                                                    View Details
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </PageContainer>

            {/* Claim QR & Order Detail Drawer */}
            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="90vh" desktopWidth="xl">
                    {selectedOrder && (
                        <>
                            <SlidingDrawerHeader
                                icon={QrCode}
                                title={`Order #${selectedOrder.id} — Hub Claim Pass`}
                                description="Present this Claim QR code to Hub Staff along with exact cash payment."
                            />

                            <div className="mt-4 space-y-5">
                                {/* Status & Countdown */}
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/30 p-3.5">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                statusBadgeMap[selectedOrder.status]?.variant ??
                                                'outline'
                                            }
                                            className={
                                                statusBadgeMap[selectedOrder.status]?.className
                                            }
                                        >
                                            {statusBadgeMap[selectedOrder.status]?.label ??
                                                selectedOrder.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            Cash Due:{' '}
                                            <strong className="text-foreground">
                                                {formatPeso(selectedOrder.total_price)}
                                            </strong>
                                        </span>
                                    </div>
                                    {selectedOrder.status === 'pending_handover' && (
                                        <ClaimCountdownBadge expiresAt={selectedOrder.expires_at} />
                                    )}
                                </div>

                                {/* QR Code Voucher for active hard holds */}
                                {selectedOrder.status === 'pending_handover' &&
                                    selectedOrder.claim_qr_code && (
                                        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="relative aspect-square w-56 max-w-full rounded-2xl border-2 border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700">
                                                    {selectedOrder.claim_qr_code_svg ? (
                                                        <div
                                                            className="flex size-full items-center justify-center [&_svg]:size-full"
                                                            dangerouslySetInnerHTML={{
                                                                __html: selectedOrder.claim_qr_code_svg,
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex size-full items-center justify-center text-muted-foreground">
                                                            <QrCode className="size-16 opacity-30" />
                                                        </div>
                                                    )}
                                                </div>

                                                <span className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                                    Claim Pass Code
                                                </span>
                                                <div className="mt-1 flex items-center gap-2 rounded-lg bg-muted px-3 py-1 font-mono text-xs font-semibold text-foreground">
                                                    <span>{selectedOrder.claim_qr_code}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            copy(selectedOrder.claim_qr_code!);
                                                            toast.success('Claim code copied');
                                                        }}
                                                        aria-label="Copy claim pass code"
                                                        className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                                        title="Copy claim code"
                                                    >
                                                        {copiedText ===
                                                        selectedOrder.claim_qr_code ? (
                                                            <Check className="size-3.5 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="size-3.5" />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!selectedOrder.claim_qr_code_svg}
                                                        onClick={() =>
                                                            handleDownloadSvg(selectedOrder)
                                                        }
                                                        className="gap-1.5 text-xs"
                                                    >
                                                        <Download className="size-3.5" />
                                                        Download SVG
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.print()}
                                                        className="gap-1.5 text-xs"
                                                    >
                                                        <Printer className="size-3.5" />
                                                        Print Pass
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                                                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                                <span>
                                                    Visit the Campus Hub before the timer reaches zero. Staff will scan this QR code, collect{' '}
                                                    <strong>{formatPeso(selectedOrder.total_price)}</strong> in cash, and hand over your items.
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                {selectedOrder.status === 'completed' &&
                                    selectedOrder.completed_at && (
                                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
                                            <CheckCircle2 className="size-4 shrink-0" />
                                            <span>
                                                Handover completed on{' '}
                                                <strong>
                                                    {new Date(
                                                        selectedOrder.completed_at,
                                                    ).toLocaleString()}
                                                </strong>
                                                .
                                            </span>
                                        </div>
                                    )}

                                {/* Order Items Breakdown */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Items in Order ({selectedOrder.items.length})
                                    </h4>
                                    <div className="divide-y rounded-xl border border-border bg-card">
                                        {selectedOrder.items.map((oi) => (
                                            <div
                                                key={oi.id}
                                                className="flex items-center justify-between gap-3 p-3 text-xs"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground">
                                                        {oi.title}
                                                    </p>
                                                    <p className="text-muted-foreground mt-0.5">
                                                        Qty {oi.quantity} × {formatPeso(oi.price)}
                                                        {oi.shelf_location
                                                            ? ` • Shelf ${oi.shelf_location}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <span className="font-bold text-foreground shrink-0">
                                                    {formatPeso(Number(oi.price) * oi.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <SlidingDrawerFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                                {selectedOrder.status === 'pending_handover' ? (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        disabled={cancellingId === selectedOrder.id}
                                        onClick={() => setCancelConfirmOrder(selectedOrder)}
                                        className="gap-1.5 text-xs"
                                    >
                                        <XCircle className="size-3.5" aria-hidden="true" />
                                        {cancellingId === selectedOrder.id
                                            ? 'Cancelling...'
                                            : 'Cancel Reservation'}
                                    </Button>
                                ) : (
                                    <div />
                                )}
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

            <ConfirmActionDialog
                open={Boolean(cancelConfirmOrder)}
                onOpenChange={(val) => {
                    if (!val) setCancelConfirmOrder(null);
                }}
                title={cancelConfirmOrder ? `Cancel Order #${cancelConfirmOrder.id}?` : 'Cancel reservation?'}
                description="All reserved items in this order will immediately return to the public campus catalog."
                confirmLabel={cancellingId !== null ? 'Cancelling...' : 'Cancel Reservation'}
                cancelLabel="Keep Reservation"
                processing={cancellingId !== null}
                onConfirm={handleConfirmCancelOrder}
            />
        </>
    );
}

StudentClaims.layout = {
    breadcrumbs: [
        {
            title: 'My Pickups',
            href: student.claims().url,
        },
    ],
};
