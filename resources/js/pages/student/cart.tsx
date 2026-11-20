import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Clock,
    Compass,
    Minus,
    Package,
    Plus,
    QrCode,
    RefreshCw,
    ShieldCheck,
    ShoppingCart,
    Tag,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
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
import { formatPeso } from '@/lib/utils';
import student from '@/routes/student';

interface CartItem {
    id: number;
    item_id: number;
    title: string;
    price: string;
    quantity: number;
    max_available: number;
    image_url: string | null;
    category: {
        id: number;
        name: string;
    } | null;
}

interface CartProps {
    cart: {
        items: CartItem[];
        total_price: string;
        expires_at: string | null;
        hasItems: boolean;
    };
}

export default function StudentCart({ cart }: CartProps) {
    const [expiresAt, setExpiresAt] = useState<string | null>(cart.expires_at);
    const [busyItemId, setBusyItemId] = useState<number | null>(null);
    const [clearing, setClearing] = useState(false);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [refreshingHold, setRefreshingHold] = useState(false);
    const lastActivityRef = useRef<number>(Date.now());

    useEffect(() => {
        setExpiresAt(cart.expires_at);
    }, [cart.expires_at]);

    const countdown = useCountdown(expiresAt);

    const pingHeartbeat = async (showFeedback = false) => {
        if (!cart.hasItems) {
            return;
        }
        if (showFeedback) {
            setRefreshingHold(true);
        }
        try {
            const meta =
                typeof document !== 'undefined'
                    ? document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                    : null;
            const cookie =
                typeof document !== 'undefined'
                    ? document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='))
                    : undefined;
            const csrf = meta?.content || (cookie ? decodeURIComponent(cookie.split('=')[1]) : '');
            const response = await fetch(student.cart.heartbeat().url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrf ? { 'X-XSRF-TOKEN': csrf, 'X-CSRF-TOKEN': csrf } : {}),
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const payload = (await response.json()) as {
                    status: string;
                    expires_at?: string | null;
                };
                if (payload.status === 'active' && payload.expires_at) {
                    setExpiresAt(payload.expires_at);
                    if (showFeedback) {
                        toast.success('Soft hold timer refreshed!');
                    }
                } else if (payload.status === 'expired' || payload.status === 'empty') {
                    router.reload({ only: ['cart', 'cartSummary'] });
                }
            }
        } catch {
            // silent retry on next activity cycle
        } finally {
            if (showFeedback) {
                setRefreshingHold(false);
            }
        }
    };

    // Track user activity and refresh rolling Soft Hold automatically while active
    useEffect(() => {
        if (!cart.hasItems) {
            return;
        }

        const markActive = () => {
            lastActivityRef.current = Date.now();
        };

        window.addEventListener('pointerdown', markActive);
        window.addEventListener('keydown', markActive);

        const interval = window.setInterval(() => {
            const idleMs = Date.now() - lastActivityRef.current;
            if (idleMs < 90_000 && document.visibilityState === 'visible') {
                void pingHeartbeat(false);
            }
        }, 60_000);

        return () => {
            window.removeEventListener('pointerdown', markActive);
            window.removeEventListener('keydown', markActive);
            window.clearInterval(interval);
        };
    }, [cart.hasItems]);

    const handleUpdateQuantity = (item: CartItem, nextQty: number) => {
        if (nextQty < 1 || nextQty > item.max_available) {
            return;
        }
        setBusyItemId(item.id);
        router.patch(
            student.cart.items.update({ orderItem: item.id }).url,
            { quantity: nextQty },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Could not update item quantity.');
                },
                onFinish: () => setBusyItemId(null),
            },
        );
    };

    const handleRemoveItem = (item: CartItem) => {
        setBusyItemId(item.id);
        router.delete(student.cart.items.destroy({ orderItem: item.id }).url, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Removed "${item.title}" from cart.`),
            onError: () => toast.error('Could not remove item from cart.'),
            onFinish: () => setBusyItemId(null),
        });
    };

    const handleClearCart = () => {
        setClearing(true);
        router.delete(student.cart.clear().url, {
            preserveScroll: true,
            onSuccess: () => toast.success('Cart cleared and items returned to catalog.'),
            onFinish: () => {
                setClearing(false);
                setClearConfirmOpen(false);
            },
        });
    };

    const handleCommitToBuy = () => {
        setCheckingOut(true);
        router.post(
            student.cart.checkout().url,
            {},
            {
                onSuccess: () => {
                    toast.success('Purchase confirmed! Your 24-hour Claim QR is ready.');
                    setCheckoutDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Unable to confirm purchase. Your hold may have expired.');
                    setCheckoutDrawerOpen(false);
                },
                onFinish: () => setCheckingOut(false),
            },
        );
    };

    const totalUnits = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Head title="My Cart - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={ShoppingCart}
                    title="Shopping Cart"
                    description="Items in your cart are protected by a rolling Soft Hold while you remain active."
                    actions={
                        cart.hasItems && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={clearing}
                                onClick={() => setClearConfirmOpen(true)}
                                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                            >
                                <Trash2 className="size-3.5" aria-hidden="true" />
                                {clearing ? 'Clearing...' : 'Clear Cart'}
                            </Button>
                        )
                    }
                />

                {/* Soft Hold Timer Banner */}
                {cart.hasItems && expiresAt && (
                    <div
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 ${
                            countdown.isExpired
                                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                : countdown.minutes < 3
                                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                                  : 'border-ocean-teal/30 bg-ocean-teal/10 text-foreground'
                        }`}
                    >
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/80 border border-border">
                                {countdown.isExpired ? (
                                    <AlertTriangle className="size-5 text-destructive" />
                                ) : (
                                    <Clock className="size-5 text-ocean-teal dark:text-seafoam-aqua" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">
                                        {countdown.isExpired
                                            ? 'Soft Hold Expired'
                                            : 'Stage 1: Soft Hold Active'}
                                    </span>
                                    {!countdown.isExpired && (
                                        <Badge
                                            variant="secondary"
                                            className="font-mono text-xs font-bold tabular-nums"
                                        >
                                            {countdown.formatted} remaining
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {countdown.isExpired
                                        ? 'Your cart hold has elapsed and items may return to the public catalog.'
                                        : 'Your timer refreshes automatically while you stay active. Click "Commit to Buy" to lock a guaranteed 24-hour pickup window.'}
                                </p>
                            </div>
                        </div>

                        {!countdown.isExpired && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={refreshingHold}
                                onClick={() => void pingHeartbeat(true)}
                                className="gap-1.5 text-xs shrink-0 bg-background"
                            >
                                <RefreshCw
                                    className={`size-3.5 ${refreshingHold ? 'animate-spin' : ''}`}
                                />
                                Refresh Hold
                            </Button>
                        )}
                    </div>
                )}

                {/* Main Content */}
                {!cart.hasItems ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <ShoppingCart className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">Your cart is empty</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Browse the campus catalog to reserve textbooks, uniforms, and PE gear with a Soft Hold.
                        </p>
                        <Button asChild size="sm" className="mt-5 gap-1.5">
                            <Link href={student.browse().url}>
                                <Compass className="size-4" />
                                Browse Marketplace
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Cart Items Column */}
                        <div className="space-y-3 lg:col-span-8">
                            {cart.items.map((item) => {
                                const isBusy = busyItemId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs"
                                    >
                                        <div className="flex items-start gap-3.5 min-w-0">
                                            <Link
                                                href={student.items.show({ item: item.item_id }).url}
                                                className="size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                                            >
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.title}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-full items-center justify-center text-muted-foreground">
                                                        <Package className="size-7 opacity-30" aria-hidden="true" />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="min-w-0 space-y-1">
                                                {item.category && (
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                        <Tag className="size-3" />
                                                        <span>{item.category.name}</span>
                                                    </div>
                                                )}
                                                <Link
                                                    href={student.items.show({ item: item.item_id }).url}
                                                    className="font-semibold text-sm text-foreground hover:text-primary line-clamp-2"
                                                >
                                                    {item.title}
                                                </Link>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatPeso(item.price)} each • Max{' '}
                                                    {item.max_available} available
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                                            {/* Quantity Stepper */}
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-10 md:size-8"
                                                    aria-label={`Decrease quantity for ${item.title}`}
                                                    disabled={isBusy || item.quantity <= 1}
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="size-3.5" aria-hidden="true" />
                                                </Button>
                                                <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-10 md:size-8"
                                                    aria-label={`Increase quantity for ${item.title}`}
                                                    disabled={
                                                        isBusy || item.quantity >= item.max_available
                                                    }
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="size-3.5" aria-hidden="true" />
                                                </Button>
                                            </div>

                                            <div className="text-right min-w-20 tabular-nums">
                                                <p className="text-sm font-extrabold text-foreground">
                                                    {formatPeso(Number(item.price) * item.quantity)}
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={isBusy}
                                                onClick={() => handleRemoveItem(item)}
                                                aria-label={`Remove ${item.title} from cart`}
                                                className="size-10 md:size-8 text-muted-foreground hover:text-destructive"
                                                title="Remove item"
                                            >
                                                <Trash2 className="size-4" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary Column */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5">
                                <h2 className="text-base font-bold text-foreground">
                                    Reservation Summary
                                </h2>

                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Reserved Items ({totalUnits})</span>
                                        <span>{formatPeso(cart.total_price)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Platform Fee</span>
                                        <span className="text-emerald-600 font-medium">₱0.00</span>
                                    </div>
                                    <div className="flex justify-between border-t border-border pt-3 text-base font-extrabold text-foreground">
                                        <span>Cash Due at Hub</span>
                                        <span>{formatPeso(cart.total_price)}</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5">
                                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                        <ShieldCheck className="size-4 text-ocean-teal" />
                                        <span>How Campus Hub Pickup Works</span>
                                    </div>
                                    <p>
                                        Confirming locks a strict <strong>24-hour Hard Hold</strong> and issues your unique <strong>Claim QR Code</strong>. Bring exact cash to the Campus Hub desk to collect your items.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    size="lg"
                                    disabled={countdown.isExpired || checkingOut}
                                    onClick={() => setCheckoutDrawerOpen(true)}
                                    className="w-full gap-2 font-semibold"
                                >
                                    <span>Buy & Lock 24h Claim Pass</span>
                                    <ArrowRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </PageContainer>

            {/* Commit to Buy Confirmation Drawer */}
            <SlidingDrawer open={checkoutDrawerOpen} onOpenChange={setCheckoutDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    <SlidingDrawerHeader
                        icon={QrCode}
                        title="Confirm Purchase (Hard Hold)"
                        description="Lock your items and generate your Campus Hub Claim QR code."
                    />

                    <div className="mt-4 space-y-4">
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                            <p className="font-semibold">Stage 2: Strict 24-Hour Countdown</p>
                            <p>
                                Once confirmed, your Claim QR code starts a fixed 24-hour countdown regardless of online status. Unclaimed orders automatically expire and return to the catalog.
                            </p>
                        </div>

                        <div className="divide-y rounded-xl border border-border bg-card">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-2 p-3 text-xs"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">
                                            {item.title}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Qty {item.quantity} × {formatPeso(item.price)}
                                        </p>
                                    </div>
                                    <span className="font-bold text-foreground shrink-0">
                                        {formatPeso(Number(item.price) * item.quantity)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-3 text-sm font-extrabold bg-muted/30">
                                <span>Total Cash Due at Hub</span>
                                <span>{formatPeso(cart.total_price)}</span>
                            </div>
                        </div>
                    </div>

                    <SlidingDrawerFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <SlidingDrawerClose asChild>
                            <Button type="button" variant="outline" size="sm">
                                Back to Cart
                            </Button>
                        </SlidingDrawerClose>
                        <Button
                            type="button"
                            size="sm"
                            disabled={checkingOut}
                            onClick={handleCommitToBuy}
                            className="gap-1.5"
                        >
                            <QrCode className="size-4" />
                            {checkingOut ? 'Generating Claim QR...' : 'Confirm & Issue Claim QR'}
                        </Button>
                    </SlidingDrawerFooter>
                </SlidingDrawerContent>
            </SlidingDrawer>

            <ConfirmActionDialog
                open={clearConfirmOpen}
                onOpenChange={setClearConfirmOpen}
                title="Clear your cart?"
                description="All reserved items in your cart will be released immediately back to the public campus catalog."
                confirmLabel={clearing ? 'Clearing...' : 'Clear Cart'}
                processing={clearing}
                onConfirm={handleClearCart}
            />
        </>
    );
}

StudentCart.layout = {
    breadcrumbs: [
        {
            title: 'Cart',
            href: student.cart().url,
        },
    ],
};
