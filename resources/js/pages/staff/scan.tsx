import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Calculator,
    Camera,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    PackageCheck,
    Printer,
    QrCode,
    Search,
    Undo2,
    Upload,
    User,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    SlidingDrawer,
    SlidingDrawerClose,
    SlidingDrawerContent,
    SlidingDrawerFooter,
    SlidingDrawerHeader,
} from '@/components/ui/sliding-drawer';
import { formatPeso } from '@/lib/utils';
import staff from '@/routes/staff';

interface ResolvedItem {
    id: number;
    title: string;
    description?: string | null;
    condition: string;
    price: string;
    quantity: number;
    status: string;
    shelf_location: string | null;
    dropoff_qr_code?: string;
    image_urls?: string[];
    dropped_off_at?: string | null;
    seller: {
        id: number;
        name: string;
        email?: string;
    };
    category: {
        id: number;
        name: string;
    } | null;
}

interface ResolvedOrderItem {
    id: number;
    quantity: number;
    price: string;
    item: {
        id: number;
        title: string;
        shelf_location: string | null;
        dropoff_qr_code?: string;
        image_url?: string | null;
    } | null;
}

interface ResolvedOrder {
    id: number;
    status: string;
    total_price: string;
    claim_qr_code: string | null;
    expires_at: string | null;
    buyer: {
        id: number;
        name: string;
        email?: string;
    };
    items?: ResolvedOrderItem[];
}

interface ScanResolution {
    type: 'dropoff' | 'claim' | 'retrieval';
    actions: string[];
    has_open_shift?: boolean;
    item?: ResolvedItem;
    order?: ResolvedOrder;
}

interface PrintableTagData {
    id: number;
    title: string;
    price: string;
    shelf_location: string | null;
    dropoff_qr_code: string;
    qr_svg?: string | null;
    seller_name?: string | null;
    category_name?: string | null;
    dropped_off_at?: string | null;
}

interface ScanPageProps {
    hasOpenShift?: boolean;
}

function getCsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    if (meta?.content) {
        return meta.content;
    }
    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

export default function Scan({ hasOpenShift = false }: ScanPageProps) {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [modalInitialTab, setModalInitialTab] = useState<'camera' | 'upload'>('camera');
    const [manualCode, setManualCode] = useState('');
    const [resolving, setResolving] = useState(false);

    const [resolution, setResolution] = useState<ScanResolution | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [recentScans, setRecentScans] = useState<
        { code: string; type: string; label: string; scannedAt: string }[]
    >([]);

    // Dropoff action state
    const [shelfLocation, setShelfLocation] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [submittingAction, setSubmittingAction] = useState(false);

    // Printable tag state
    const [tagData, setTagData] = useState<PrintableTagData | null>(null);
    const [tagDrawerOpen, setTagDrawerOpen] = useState(false);

    const effectiveHasOpenShift = resolution?.has_open_shift ?? hasOpenShift;

    const resolveCode = async (rawCode: string) => {
        const code = rawCode.trim();
        if (!code) {
            return;
        }

        setResolving(true);
        setShowRejectForm(false);
        setShelfLocation('');
        setRejectionReason('');

        try {
            const csrf = getCsrfToken();
            const response = await fetch(staff.scan.resolve().url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrf ? { 'X-XSRF-TOKEN': csrf, 'X-CSRF-TOKEN': csrf } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ code }),
            });

            const payload = await response.json();

            if (!response.ok) {
                const msg =
                    payload?.errors?.code?.[0] ||
                    payload?.message ||
                    'QR code was not recognized.';
                toast.error(msg);
                return;
            }

            const resolved = payload as ScanResolution;
            setResolution(resolved);
            setDrawerOpen(true);
            setManualCode('');

            const label =
                resolved.type === 'claim'
                    ? `Claim Order #${resolved.order?.id}`
                    : `${resolved.item?.title ?? 'Item'}`;

            setRecentScans((prev) => [
                {
                    code,
                    type: resolved.type,
                    label,
                    scannedAt: new Date().toLocaleTimeString(),
                },
                ...prev.slice(0, 9),
            ]);
        } catch {
            toast.error('Unable to reach the server to resolve this QR code.');
        } finally {
            setResolving(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void resolveCode(manualCode);
    };

    const handleOpenTag = async (itemId: number) => {
        try {
            const res = await fetch(staff.dropOffs.tag({ item: itemId }).url, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) {
                toast.error('Failed to load tracking tag.');
                return;
            }
            const data = (await res.json()) as PrintableTagData;
            setTagData(data);
            setTagDrawerOpen(true);
        } catch {
            toast.error('Failed to load tracking tag.');
        }
    };

    const handleApproveDropoff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolution?.item || !shelfLocation.trim()) {
            return;
        }
        const itemId = resolution.item.id;
        setSubmittingAction(true);
        router.post(
            staff.dropOffs.approve({ item: itemId }).url,
            { shelf_location: shelfLocation.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Item approved and published to catalog!');
                    setDrawerOpen(false);
                    void handleOpenTag(itemId);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to approve drop-off.');
                },
                onFinish: () => setSubmittingAction(false),
            },
        );
    };

    const handleRejectDropoff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolution?.item || !rejectionReason.trim()) {
            return;
        }
        setSubmittingAction(true);
        router.post(
            staff.dropOffs.reject({ item: resolution.item.id }).url,
            { rejection_reason: rejectionReason.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Drop-off rejected and seller notified.');
                    setDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to reject drop-off.');
                },
                onFinish: () => setSubmittingAction(false),
            },
        );
    };

    const handleCompleteClaim = () => {
        if (!resolution?.order) {
            return;
        }
        setSubmittingAction(true);
        router.post(
            staff.claims.complete({ order: resolution.order.id }).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Handover completed! Cash recorded in your shift drawer.');
                    setDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Could not complete claim handover.');
                },
                onFinish: () => setSubmittingAction(false),
            },
        );
    };

    const handleRetrieveExpired = () => {
        if (!resolution?.item) {
            return;
        }
        setSubmittingAction(true);
        router.post(
            staff.returns.retrieve({ item: resolution.item.id }).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Expired item marked as retrieved by seller.');
                    setDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Could not mark item retrieved.');
                },
                onFinish: () => setSubmittingAction(false),
            },
        );
    };

    return (
        <>
            <Head title="Hub QR Scanner - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={QrCode}
                    title="Campus Hub Desk Scanner"
                    description="Scan any student Drop-off QR, Buyer Claim QR, or Expired Return QR to pull up instant desk actions."
                    actions={
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={resolving}
                                onClick={() => {
                                    setModalInitialTab('upload');
                                    setIsScannerOpen(true);
                                }}
                                className="gap-2 cursor-pointer"
                            >
                                <Upload className="size-4" />
                                Upload QR Image
                            </Button>
                            <Button
                                type="button"
                                disabled={resolving}
                                onClick={() => {
                                    setModalInitialTab('camera');
                                    setIsScannerOpen(true);
                                }}
                                className="gap-2 cursor-pointer"
                            >
                                <Camera className="size-4" />
                                Scan with Camera
                            </Button>
                        </>
                    }
                />

                {/* Shift Status Banner */}
                {!hasOpenShift && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <div>
                                <p className="font-semibold">No Active Shift Open</p>
                                <p className="mt-0.5 opacity-90">
                                    You can inspect drop-offs and returns, but completing buyer claims (cash intake) or releasing cash payouts requires an open shift.
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

                {/* Scanner Command Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">
                            Manual Code Lookup
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Enter or paste a Drop-off, Claim, or Retrieval ULID code if camera scanning is unavailable.
                        </p>
                    </div>

                    {/* Manual ULID Fallback Input */}
                    <form
                        onSubmit={handleManualSubmit}
                        className="flex flex-col sm:flex-row gap-2"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                aria-label="Manual Drop-off or Claim ULID code"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Or paste/type a Drop-off or Claim ULID code..."
                                className="pl-9 font-mono"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={resolving || !manualCode.trim()}
                            className="shrink-0"
                        >
                            {resolving ? 'Resolving...' : 'Lookup Code'}
                        </Button>
                    </form>
                </div>

                {/* Quick Operations Shortcuts */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Link
                        href={staff.dropOffs().url}
                        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-xs"
                    >
                        <Package className="size-5 text-amber-600" />
                        <span className="text-sm font-semibold text-foreground">Drop-Off Queue</span>
                        <span className="text-xs text-muted-foreground">Inspect & shelf items</span>
                    </Link>
                    <Link
                        href={staff.claims().url}
                        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-xs"
                    >
                        <PackageCheck className="size-5 text-ocean-teal" />
                        <span className="text-sm font-semibold text-foreground">Buyer Claims</span>
                        <span className="text-xs text-muted-foreground">Handover & cash intake</span>
                    </Link>
                    <Link
                        href={staff.payouts().url}
                        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-xs"
                    >
                        <Banknote className="size-5 text-emerald-600" />
                        <span className="text-sm font-semibold text-foreground">Dual Payouts</span>
                        <span className="text-xs text-muted-foreground">Digital QR & cash holds</span>
                    </Link>
                    <Link
                        href={staff.returns().url}
                        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-xs"
                    >
                        <Undo2 className="size-5 text-rose-600" />
                        <span className="text-sm font-semibold text-foreground">Shelf Returns</span>
                        <span className="text-xs text-muted-foreground">Expired item retrievals</span>
                    </Link>
                </div>

                {/* Recent Session Scans */}
                {recentScans.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
                        <div className="border-b border-border bg-muted/30 px-4 py-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Recent Desk Lookups ({recentScans.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-border">
                            {recentScans.map((entry, idx) => (
                                <button
                                    key={`${entry.code}-${idx}`}
                                    type="button"
                                    onClick={() => void resolveCode(entry.code)}
                                    className="flex w-full items-center justify-between gap-3 p-3.5 text-left text-xs hover:bg-muted/40 transition cursor-pointer"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="uppercase text-[10px]">
                                                {entry.type}
                                            </Badge>
                                            <span className="font-semibold text-foreground truncate">
                                                {entry.label}
                                            </span>
                                        </div>
                                        <p className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">
                                            {entry.code}
                                        </p>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground shrink-0">
                                        {entry.scannedAt}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </PageContainer>

            {/* Live Camera / File QR Scanner Modal */}
            <QrScannerModal
                open={isScannerOpen}
                defaultTab={modalInitialTab}
                onOpenChange={setIsScannerOpen}
                onScan={(decodedText) => {
                    void resolveCode(decodedText);
                }}
            />

            {/* Scan Resolution Action Drawer */}
            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="90vh" desktopWidth="xl">
                    {resolution?.type === 'dropoff' && resolution.item && (
                        <>
                            <SlidingDrawerHeader
                                icon={Package}
                                title="Item Drop-off Inspection"
                                description="Verify the physical item matches the listing, assign a shelf code, or reject."
                            />

                            <div className="mt-4 space-y-5">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">{resolution.item.status}</Badge>
                                        {resolution.item.category && (
                                            <Badge variant="secondary">
                                                {resolution.item.category.name}
                                            </Badge>
                                        )}
                                        <Badge variant="secondary">{resolution.item.condition}</Badge>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">
                                        {resolution.item.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="font-bold text-foreground text-base">
                                            {formatPeso(resolution.item.price)}
                                        </span>
                                        <span>Qty: {resolution.item.quantity}</span>
                                        <span className="inline-flex items-center gap-1">
                                            <User className="size-3.5" />
                                            {resolution.item.seller.name}
                                        </span>
                                    </div>
                                </div>

                                {resolution.item.image_urls &&
                                    resolution.item.image_urls.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {resolution.item.image_urls.map((url) => (
                                                <img
                                                    key={url}
                                                    src={url}
                                                    alt={resolution.item!.title}
                                                    className="aspect-square w-full rounded-xl border border-border object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}

                                {resolution.item.description && (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
                                        <p className="font-semibold uppercase text-[10px] text-muted-foreground">
                                            Seller Description
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-foreground">
                                            {resolution.item.description}
                                        </p>
                                    </div>
                                )}

                                {resolution.actions.includes('approve') ? (
                                    <div className="space-y-4">
                                        {!showRejectForm ? (
                                            <form
                                                onSubmit={handleApproveDropoff}
                                                className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
                                            >
                                                <Label
                                                    htmlFor="scan_shelf_location"
                                                    className="text-xs font-semibold"
                                                >
                                                    Assign Hub Shelf / Bin Location *
                                                </Label>
                                                <Input
                                                    id="scan_shelf_location"
                                                    value={shelfLocation}
                                                    onChange={(e) =>
                                                        setShelfLocation(e.target.value)
                                                    }
                                                    placeholder="e.g. Shelf-A04, Bin-ENG12"
                                                    maxLength={50}
                                                    required
                                                />
                                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowRejectForm(true)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs gap-1"
                                                    >
                                                        <XCircle className="size-3.5" />
                                                        Reject Instead
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={
                                                            submittingAction ||
                                                            !shelfLocation.trim()
                                                        }
                                                        className="gap-1.5 text-xs"
                                                    >
                                                        <CheckCircle2 className="size-4" />
                                                        {submittingAction
                                                            ? 'Approving...'
                                                            : 'Approve & Publish to Catalog'}
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <form
                                                onSubmit={handleRejectDropoff}
                                                className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
                                            >
                                                <Label
                                                    htmlFor="scan_rejection_reason"
                                                    className="text-xs font-semibold text-destructive"
                                                >
                                                    Rejection Reason *
                                                </Label>
                                                <Textarea
                                                    id="scan_rejection_reason"
                                                    rows={3}
                                                    value={rejectionReason}
                                                    onChange={(e) =>
                                                        setRejectionReason(e.target.value)
                                                    }
                                                    placeholder="Explain why the item failed physical inspection..."
                                                    required
                                                    className="bg-background"
                                                />
                                                <div className="flex items-center justify-between gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowRejectForm(false)}
                                                        className="text-xs"
                                                    >
                                                        Back to Approval
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={
                                                            submittingAction ||
                                                            !rejectionReason.trim()
                                                        }
                                                        className="gap-1.5 text-xs"
                                                    >
                                                        <XCircle className="size-4" />
                                                        {submittingAction
                                                            ? 'Rejecting...'
                                                            : 'Confirm Rejection'}
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
                                        <span>
                                            This item is currently{' '}
                                            <strong className="uppercase">
                                                {resolution.item.status}
                                            </strong>
                                            {resolution.item.shelf_location
                                                ? ` at ${resolution.item.shelf_location}`
                                                : ''}
                                            .
                                        </span>
                                        {resolution.item.shelf_location && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    void handleOpenTag(resolution.item!.id)
                                                }
                                                className="gap-1.5 text-xs"
                                            >
                                                <Printer className="size-3.5" />
                                                Print Tag
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {resolution?.type === 'claim' && resolution.order && (
                        <>
                            <SlidingDrawerHeader
                                icon={PackageCheck}
                                title={`Buyer Claim Order #${resolution.order.id}`}
                                description="Pull items from Hub shelves, collect exact physical cash, and complete handover."
                            />

                            <div className="mt-4 space-y-4">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <Badge variant="outline">{resolution.order.status}</Badge>
                                        <p className="text-sm font-semibold text-foreground">
                                            Buyer: {resolution.order.buyer.name}
                                        </p>
                                        {resolution.order.expires_at && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="size-3.5" />
                                                Expires:{' '}
                                                {new Date(
                                                    resolution.order.expires_at,
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
                                            Collect Cash
                                        </span>
                                        <span className="text-2xl font-extrabold text-ocean-teal dark:text-seafoam-aqua">
                                            {formatPeso(resolution.order.total_price)}
                                        </span>
                                    </div>
                                </div>

                                {resolution.order.items && resolution.order.items.length > 0 && (
                                    <div className="divide-y rounded-xl border border-border bg-card">
                                        {resolution.order.items.map((oi) => (
                                            <div
                                                key={oi.id}
                                                className="flex items-center justify-between gap-3 p-3 text-xs"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground">
                                                        {oi.item?.title ?? 'Item'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
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
                                )}

                                {resolution.actions.includes('complete') &&
                                    !effectiveHasOpenShift && (
                                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between gap-3">
                                            <span>
                                                Open your shift drawer before accepting cash payment.
                                            </span>
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="bg-background shrink-0 text-xs"
                                            >
                                                <Link href={staff.drawerCount().url}>Open Shift</Link>
                                            </Button>
                                        </div>
                                    )}
                            </div>

                            <SlidingDrawerFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                <SlidingDrawerClose asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        Close
                                    </Button>
                                </SlidingDrawerClose>
                                {resolution.actions.includes('complete') && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={submittingAction || !effectiveHasOpenShift}
                                        onClick={handleCompleteClaim}
                                        className="gap-1.5"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        {submittingAction
                                            ? 'Completing...'
                                            : `Collect ${formatPeso(resolution.order.total_price)} & Complete Handover`}
                                    </Button>
                                )}
                            </SlidingDrawerFooter>
                        </>
                    )}

                    {resolution?.type === 'retrieval' && resolution.item && (
                        <>
                            <SlidingDrawerHeader
                                icon={Undo2}
                                title="Expired Item Seller Retrieval"
                                description="Verify the original seller and return their expired consignment item."
                            />

                            <div className="mt-4 space-y-4">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                                    <Badge variant="destructive">Shelf Expired</Badge>
                                    <h3 className="text-lg font-bold text-foreground">
                                        {resolution.item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Seller: <strong>{resolution.item.seller.name}</strong>
                                    </p>
                                    {resolution.item.shelf_location && (
                                        <p className="text-xs text-ocean-teal font-semibold flex items-center gap-1">
                                            <MapPin className="size-3.5" />
                                            Shelf: {resolution.item.shelf_location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <SlidingDrawerFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                                <SlidingDrawerClose asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        Close
                                    </Button>
                                </SlidingDrawerClose>
                                {resolution.actions.includes('retrieve') && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={submittingAction}
                                        onClick={handleRetrieveExpired}
                                        className="gap-1.5"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        {submittingAction
                                            ? 'Confirming...'
                                            : 'Confirm Returned to Seller'}
                                    </Button>
                                )}
                            </SlidingDrawerFooter>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>

            {/* Printable Shelf Tracking Tag Drawer */}
            <SlidingDrawer open={tagDrawerOpen} onOpenChange={setTagDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="md">
                    {tagData && (
                        <>
                            <SlidingDrawerHeader
                                icon={Printer}
                                title="Physical Shelf Tracking Tag"
                                description="Print and attach this tag to the approved consignment item on the Hub shelf."
                            />

                            <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-white p-5 text-slate-900 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="font-black text-base tracking-tight">
                                        UniMart Hub Tag
                                    </span>
                                    <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                                        {tagData.shelf_location ?? 'UNASSIGNED'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {tagData.qr_svg && (
                                        <div
                                            className="size-28 shrink-0 [&_svg]:size-full"
                                            dangerouslySetInnerHTML={{ __html: tagData.qr_svg }}
                                        />
                                    )}
                                    <div className="min-w-0 space-y-1 text-xs">
                                        <p className="font-bold text-sm leading-tight">
                                            {tagData.title}
                                        </p>
                                        <p className="font-extrabold text-base">
                                            {formatPeso(tagData.price)}
                                        </p>
                                        {tagData.seller_name && (
                                            <p className="text-slate-600">
                                                Seller: {tagData.seller_name}
                                            </p>
                                        )}
                                        <p className="font-mono text-[10px] text-slate-500 break-all">
                                            {tagData.dropoff_qr_code}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <SlidingDrawerFooter className="mt-6 flex justify-end gap-2">
                                <SlidingDrawerClose asChild>
                                    <Button type="button" variant="outline" size="sm">
                                        Close
                                    </Button>
                                </SlidingDrawerClose>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => window.print()}
                                    className="gap-1.5"
                                >
                                    <Printer className="size-4" />
                                    Print Tracking Tag
                                </Button>
                            </SlidingDrawerFooter>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>
        </>
    );
}

Scan.layout = {
    breadcrumbs: [
        {
            title: 'Scanner',
            href: staff.scan().url,
        },
    ],
};
