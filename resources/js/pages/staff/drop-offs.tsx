import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Package,
    Printer,
    QrCode,
    Tag,
    User,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '@/components/page-layout';
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
import staff from '@/routes/staff';
import type { PaginatedData } from '@/types/admin';

interface PendingDropoffItem {
    id: number;
    title: string;
    description?: string | null;
    condition: string;
    price: string;
    quantity: number;
    dropoff_qr_code: string;
    image_urls?: string[];
    seller: {
        id: number;
        name: string;
        email: string;
    };
    category: {
        id: number;
        name: string;
    } | null;
    created_at: string | null;
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
}

interface StaffDropOffsProps {
    pendingItems: PaginatedData<PendingDropoffItem>;
}

const conditionLabels: Record<string, string> = {
    new: 'Brand New',
    like_new: 'Like New',
    used: 'Used',
};

function formatPeso(amount: string | number): string {
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function DropOffs({ pendingItems }: StaffDropOffsProps) {
    const [selectedItem, setSelectedItem] = useState<PendingDropoffItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mode, setMode] = useState<'approve' | 'reject'>('approve');
    const [shelfLocation, setShelfLocation] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [tagData, setTagData] = useState<PrintableTagData | null>(null);
    const [tagDrawerOpen, setTagDrawerOpen] = useState(false);

    const openInspection = (item: PendingDropoffItem) => {
        setSelectedItem(item);
        setMode('approve');
        setShelfLocation('');
        setRejectionReason('');
        setDrawerOpen(true);
    };

    const loadTrackingTag = async (itemId: number) => {
        try {
            const res = await fetch(staff.dropOffs.tag({ item: itemId }).url, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (res.ok) {
                const data = (await res.json()) as PrintableTagData;
                setTagData(data);
                setTagDrawerOpen(true);
            }
        } catch {
            // ignore
        }
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !shelfLocation.trim()) return;
        const itemId = selectedItem.id;
        setSubmitting(true);
        router.post(
            staff.dropOffs.approve({ item: itemId }).url,
            { shelf_location: shelfLocation.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`"${selectedItem.title}" approved & assigned to ${shelfLocation.trim()}!`);
                    setDrawerOpen(false);
                    void loadTrackingTag(itemId);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to approve drop-off.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !rejectionReason.trim()) return;
        setSubmitting(true);
        router.post(
            staff.dropOffs.reject({ item: selectedItem.id }).url,
            { rejection_reason: rejectionReason.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Drop-off rejected.');
                    setDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to reject drop-off.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <>
            <Head title="Drop-Off Queue - UniMart Staff" />

            <PageContainer>
                <PageHeader
                    icon={Package}
                    title="Pending Item Drop-Offs"
                    description="Inspect physical items brought by student sellers, assign a shelf code, and print tracking tags."
                    actions={
                        <Button asChild size="sm" className="gap-1.5">
                            <Link href={staff.scan().url}>
                                <QrCode className="size-4" />
                                Open QR Scanner
                            </Link>
                        </Button>
                    }
                />

                {pendingItems.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Package className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No pending drop-offs</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            All student listings awaiting Hub verification have been processed.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {pendingItems.data.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition"
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                                        {item.image_urls && item.image_urls.length > 0 ? (
                                            <img
                                                src={item.image_urls[0]}
                                                alt={item.title}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                                <Package className="size-5 opacity-40" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                {item.title}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px]">
                                                {conditionLabels[item.condition] ?? item.condition}
                                            </Badge>
                                            {item.category && (
                                                <Badge variant="outline" className="text-[10px] gap-1">
                                                    <Tag className="size-2.5" />
                                                    {item.category.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="font-bold text-foreground">
                                                {formatPeso(item.price)}
                                            </span>
                                            <span>Qty: {item.quantity}</span>
                                            <span className="inline-flex items-center gap-1">
                                                <User className="size-3" />
                                                {item.seller.name}
                                            </span>
                                            <span className="font-mono text-[11px]">
                                                {item.dropoff_qr_code}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => openInspection(item)}
                                    className="shrink-0 text-xs"
                                >
                                    Inspect & Process
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {pendingItems.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {pendingItems.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={pendingItems.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {pendingItems.current_page} of {pendingItems.last_page}
                        </span>
                        {pendingItems.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={pendingItems.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            {/* Drop-off Inspection Drawer */}
            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="90vh" desktopWidth="xl">
                    {selectedItem && (
                        <>
                            <SlidingDrawerHeader
                                icon={Package}
                                title="Inspect Physical Drop-off"
                                description="Verify item condition and assign a Hub shelf bin to publish live in catalog."
                            />

                            <div className="mt-4 space-y-5">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                                    <h3 className="text-lg font-bold text-foreground">
                                        {selectedItem.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span className="text-base font-extrabold text-foreground">
                                            {formatPeso(selectedItem.price)}
                                        </span>
                                        <span>Qty: {selectedItem.quantity}</span>
                                        <span>
                                            Condition:{' '}
                                            {conditionLabels[selectedItem.condition] ??
                                                selectedItem.condition}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Seller: <strong>{selectedItem.seller.name}</strong> (
                                        {selectedItem.seller.email})
                                    </p>
                                    <p className="font-mono text-[11px] text-muted-foreground">
                                        Drop-off Code: {selectedItem.dropoff_qr_code}
                                    </p>
                                </div>

                                {selectedItem.image_urls && selectedItem.image_urls.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedItem.image_urls.map((url) => (
                                            <img
                                                key={url}
                                                src={url}
                                                alt={selectedItem.title}
                                                className="aspect-square w-full rounded-xl border border-border object-cover"
                                            />
                                        ))}
                                    </div>
                                )}

                                {selectedItem.description && (
                                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
                                        <p className="font-semibold uppercase text-[10px] text-muted-foreground">
                                            Description
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-foreground">
                                            {selectedItem.description}
                                        </p>
                                    </div>
                                )}

                                {/* Action Mode Toggle */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant={mode === 'approve' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setMode('approve')}
                                        className="gap-1.5 text-xs"
                                    >
                                        <CheckCircle2 className="size-3.5" />
                                        Approve & Shelve
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={mode === 'reject' ? 'destructive' : 'outline'}
                                        size="sm"
                                        onClick={() => setMode('reject')}
                                        className="gap-1.5 text-xs"
                                    >
                                        <XCircle className="size-3.5" />
                                        Reject Drop-off
                                    </Button>
                                </div>

                                {mode === 'approve' ? (
                                    <form onSubmit={handleApprove} className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="dropoff_shelf_location"
                                                className="text-xs font-semibold"
                                            >
                                                Hub Shelf / Bin Location *
                                            </Label>
                                            <Input
                                                id="dropoff_shelf_location"
                                                value={shelfLocation}
                                                onChange={(e) => setShelfLocation(e.target.value)}
                                                placeholder="e.g. Shelf-NUR02, Rack-B04"
                                                maxLength={50}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <SlidingDrawerClose asChild>
                                                <Button type="button" variant="outline" size="sm">
                                                    Cancel
                                                </Button>
                                            </SlidingDrawerClose>
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={submitting || !shelfLocation.trim()}
                                                className="gap-1.5"
                                            >
                                                <CheckCircle2 className="size-4" />
                                                {submitting
                                                    ? 'Approving...'
                                                    : 'Approve & Generate Tag'}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleReject} className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="dropoff_reject_reason"
                                                className="text-xs font-semibold text-destructive"
                                            >
                                                Rejection Reason *
                                            </Label>
                                            <Textarea
                                                id="dropoff_reject_reason"
                                                rows={3}
                                                value={rejectionReason}
                                                onChange={(e) =>
                                                    setRejectionReason(e.target.value)
                                                }
                                                placeholder="Specify damage, mismatch, or prohibited item reason..."
                                                required
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <SlidingDrawerClose asChild>
                                                <Button type="button" variant="outline" size="sm">
                                                    Cancel
                                                </Button>
                                            </SlidingDrawerClose>
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                size="sm"
                                                disabled={submitting || !rejectionReason.trim()}
                                                className="gap-1.5"
                                            >
                                                <XCircle className="size-4" />
                                                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
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
                                title="Printable Hub Shelf Tag"
                                description="Attach this printed tag to the physical item on the Hub shelf."
                            />

                            <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-white p-5 text-slate-900 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="font-black text-base">UniMart Hub Tag</span>
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
                                    Print Tag
                                </Button>
                            </SlidingDrawerFooter>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>
        </>
    );
}

DropOffs.layout = {
    breadcrumbs: [
        {
            title: 'Drop-Offs',
            href: staff.dropOffs().url,
        },
    ],
};
