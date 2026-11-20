import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    List,
    MapPin,
    Package,
    Tag,
    User,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InPageNav } from '@/components/ui/in-page-nav';
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
import admin from '@/routes/admin';
import type { PaginatedData } from '@/types/admin';

interface AdminInventoryItem {
    id: number;
    title: string;
    condition: string;
    price: string;
    quantity: number;
    status: string;
    shelf_location: string | null;
    dropoff_qr_code: string;
    seller: { id: number; name: string; email: string } | null;
    category: { id: number; name: string } | null;
    created_at: string | null;
}

interface AdminInventoryProps {
    items: PaginatedData<AdminInventoryItem>;
    selectedStatus: string | null;
}

const statusTabs = [
    { key: null, label: 'All Items' },
    { key: 'available', label: 'Available' },
    { key: 'pending_dropoff', label: 'Pending Drop-off' },
    { key: 'sold', label: 'Sold' },
    { key: 'expired', label: 'Expired' },
    { key: 'retrieved', label: 'Retrieved' },
    { key: 'rejected', label: 'Rejected' },
];

const statusColors: Record<string, string> = {
    available: 'bg-emerald-600 text-white',
    pending_dropoff: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    sold: '',
    expired: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    retrieved: '',
    rejected: '',
};

export default function Inventory({ items, selectedStatus }: AdminInventoryProps) {
    const [selectedItem, setSelectedItem] = useState<AdminInventoryItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [takeDownReason, setTakeDownReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleFilter = (statusKey: string | null) => {
        router.get(
            admin.inventory().url,
            statusKey ? { status: statusKey } : {},
            { preserveState: true },
        );
    };

    const handleTakeDown = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        setSubmitting(true);
        router.post(
            admin.inventory.takeDown({ item: selectedItem.id }).url,
            { reason: takeDownReason.trim() || undefined },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`"${selectedItem.title}" has been taken down from the catalog.`);
                    setDrawerOpen(false);
                    setTakeDownReason('');
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Cannot take down item (may have active buyer holds).');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <>
            <Head title="Hub Inventory - UniMart Admin" />

            <PageContainer>
                <PageHeader
                    icon={List}
                    title="Marketplace Inventory"
                    description="Oversee all consigned items across statuses and perform administrative take-downs when necessary."
                />

                <InPageNav
                    ariaLabel="Inventory status tabs"
                    items={statusTabs.map((tab) => ({
                        title: tab.label,
                        isActive:
                            selectedStatus === tab.key || (!selectedStatus && tab.key === null),
                        onClick: () => handleFilter(tab.key),
                    }))}
                />

                {items.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <Package className="size-8 text-muted-foreground opacity-40" />
                        <h3 className="mt-3 font-semibold text-foreground">No items found</h3>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {items.data.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition"
                            >
                                <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-sm text-foreground">
                                            {item.title}
                                        </span>
                                        <Badge
                                            variant={
                                                item.status === 'rejected'
                                                    ? 'destructive'
                                                    : item.status === 'available'
                                                      ? 'default'
                                                      : 'outline'
                                            }
                                            className={`text-[10px] capitalize ${statusColors[item.status] || ''}`}
                                        >
                                            {item.status.replace('_', ' ')}
                                        </Badge>
                                        {item.shelf_location && (
                                            <Badge variant="secondary" className="gap-1 text-[10px]">
                                                <MapPin className="size-2.5" />
                                                {item.shelf_location}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span className="font-bold text-foreground">
                                            {formatPeso(item.price)}
                                        </span>
                                        <span>Qty: {item.quantity}</span>
                                        {item.category && (
                                            <span className="inline-flex items-center gap-1">
                                                <Tag className="size-3" />
                                                {item.category.name}
                                            </span>
                                        )}
                                        {item.seller && (
                                            <span className="inline-flex items-center gap-1">
                                                <User className="size-3" />
                                                {item.seller.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setTakeDownReason('');
                                        setDrawerOpen(true);
                                    }}
                                    className="shrink-0 text-xs"
                                >
                                    Inspect
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {items.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {items.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={items.prev_page_url} preserveState>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Page {items.current_page} of {items.last_page}
                        </span>
                        {items.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <Link href={items.next_page_url} preserveState>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </PageContainer>

            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {selectedItem && (
                        <>
                            <SlidingDrawerHeader
                                icon={Package}
                                title={`Item #${selectedItem.id}`}
                                description="Inventory specifications and administrative moderation controls."
                            />

                            <div className="mt-4 space-y-4 text-xs">
                                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5">
                                    <p className="text-base font-bold text-foreground">
                                        {selectedItem.title}
                                    </p>
                                    <p className="text-lg font-extrabold text-foreground">
                                        {formatPeso(selectedItem.price)}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            (Qty {selectedItem.quantity})
                                        </span>
                                    </p>
                                    <p className="text-muted-foreground">
                                        Status:{' '}
                                        <strong className="uppercase text-foreground">
                                            {selectedItem.status}
                                        </strong>
                                        {selectedItem.shelf_location
                                            ? ` • Shelf ${selectedItem.shelf_location}`
                                            : ''}
                                    </p>
                                    {selectedItem.seller && (
                                        <p className="text-muted-foreground">
                                            Seller: <strong>{selectedItem.seller.name}</strong> (
                                            {selectedItem.seller.email})
                                        </p>
                                    )}
                                    <p className="font-mono text-[11px] text-muted-foreground">
                                        Drop-off QR: {selectedItem.dropoff_qr_code}
                                    </p>
                                </div>

                                {(selectedItem.status === 'available' ||
                                    selectedItem.status === 'pending_dropoff') && (
                                    <form
                                        onSubmit={handleTakeDown}
                                        className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3"
                                    >
                                        <div className="flex items-center gap-1.5 font-semibold text-destructive">
                                            <AlertTriangle className="size-4" />
                                            <span>Take Down Listing</span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            Taking down an item marks it as expired so it is removed from the public catalog and returned to the seller (blocked if locked in an active buyer claim).
                                        </p>
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="takedown_reason"
                                                className="text-xs font-semibold"
                                            >
                                                Moderation Reason (Optional)
                                            </Label>
                                            <Textarea
                                                id="takedown_reason"
                                                rows={2}
                                                value={takeDownReason}
                                                onChange={(e) => setTakeDownReason(e.target.value)}
                                                placeholder="Reason for administrative take-down..."
                                                className="bg-background"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            size="sm"
                                            disabled={submitting}
                                            className="w-full"
                                        >
                                            {submitting ? 'Taking Down...' : 'Confirm Take-Down'}
                                        </Button>
                                    </form>
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

Inventory.layout = {
    breadcrumbs: [
        {
            title: 'Inventory',
            href: admin.inventory().url,
        },
    ],
};
