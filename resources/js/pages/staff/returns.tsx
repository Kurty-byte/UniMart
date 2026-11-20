import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    MapPin,
    QrCode,
    Undo2,
    User,
} from 'lucide-react';
import { toast } from 'sonner';
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
import staff from '@/routes/staff';
import type { PaginatedData } from '@/types/admin';

interface ExpiredItemRecord {
    id: number;
    title: string;
    price: string;
    shelf_location: string | null;
    dropoff_qr_code: string;
    seller: {
        id: number;
        name: string;
        email: string;
    };
    dropped_off_at: string | null;
}

interface RetrievedItemRecord {
    id: number;
    title: string;
    price: string;
    seller: {
        id: number;
        name: string;
        email: string;
    };
    updated_at: string | null;
}

interface StaffReturnsProps {
    expiredItems: PaginatedData<ExpiredItemRecord>;
    retrievedItems: PaginatedData<RetrievedItemRecord>;
}

function formatPeso(amount: string | number): string {
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function Returns({ expiredItems, retrievedItems }: StaffReturnsProps) {
    const [activeTab, setActiveTab] = useState<'expired' | 'retrieved'>('expired');
    const [selectedExpired, setSelectedExpired] = useState<ExpiredItemRecord | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleRetrieve = () => {
        if (!selectedExpired) return;
        setSubmitting(true);
        router.post(
            staff.returns.retrieve({ item: selectedExpired.id }).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`"${selectedExpired.title}" marked as retrieved by owner.`);
                    setDrawerOpen(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string | undefined;
                    toast.error(msg || 'Failed to mark item as retrieved.');
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <>
            <Head title="Expired Item Returns - UniMart Staff" />

            <PageContainer>
                <PageHeader
                    icon={Undo2}
                    title="Expired Items & Seller Returns"
                    description="Return shelf-expired items back to their original student owners."
                    actions={
                        <Button asChild size="sm" className="gap-1.5">
                            <Link href={staff.scan().url}>
                                <QrCode className="size-4" />
                                Scan Retrieval QR
                            </Link>
                        </Button>
                    }
                />

                <InPageNav
                    ariaLabel="Staff returns tabs"
                    items={[
                        {
                            title: 'Awaiting Seller Pickup',
                            icon: Clock,
                            badge: expiredItems.total,
                            isActive: activeTab === 'expired',
                            onClick: () => setActiveTab('expired'),
                        },
                        {
                            title: 'Retrieved History',
                            icon: CheckCircle2,
                            badge: retrievedItems.total,
                            isActive: activeTab === 'retrieved',
                            onClick: () => setActiveTab('retrieved'),
                        },
                    ]}
                />

                {activeTab === 'expired' ? (
                    expiredItems.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                            <Undo2 className="size-8 text-muted-foreground opacity-40" />
                            <h3 className="mt-3 font-semibold text-foreground">
                                No expired items on shelf
                            </h3>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                            {expiredItems.data.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                {item.title}
                                            </span>
                                            {item.shelf_location && (
                                                <Badge variant="secondary" className="gap-1 text-[10px]">
                                                    <MapPin className="size-3" />
                                                    {item.shelf_location}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <User className="size-3" />
                                                {item.seller.name} ({item.seller.email})
                                            </span>
                                            <span>{formatPeso(item.price)}</span>
                                            <span className="font-mono text-[11px]">
                                                {item.dropoff_qr_code}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedExpired(item);
                                            setDrawerOpen(true);
                                        }}
                                        className="shrink-0 text-xs"
                                    >
                                        Return to Owner
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )
                ) : retrievedItems.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <CheckCircle2 className="size-8 text-muted-foreground opacity-40" />
                        <h3 className="mt-3 font-semibold text-foreground">
                            No retrieved items yet
                        </h3>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs divide-y divide-border">
                        {retrievedItems.data.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-xs"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-foreground">
                                            {item.title}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px]">
                                            Retrieved
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground">
                                        Seller: {item.seller.name} ({item.seller.email}) •{' '}
                                        {formatPeso(item.price)}
                                    </p>
                                </div>
                                {item.updated_at && (
                                    <span className="text-muted-foreground">
                                        Returned {new Date(item.updated_at).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </PageContainer>

            <SlidingDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SlidingDrawerContent maxHeight="85vh" desktopWidth="lg">
                    {selectedExpired && (
                        <>
                            <SlidingDrawerHeader
                                icon={Undo2}
                                title="Confirm Owner Retrieval"
                                description="Verify the student seller's Drop-off QR or ID before handing back the expired item."
                            />

                            <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-xs">
                                <p className="text-base font-bold text-foreground">
                                    {selectedExpired.title}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">Owner: </span>
                                    <strong>{selectedExpired.seller.name}</strong> (
                                    {selectedExpired.seller.email})
                                </p>
                                {selectedExpired.shelf_location && (
                                    <p className="font-semibold text-ocean-teal">
                                        Pull from Shelf: {selectedExpired.shelf_location}
                                    </p>
                                )}
                                <p className="font-mono text-[11px] text-muted-foreground">
                                    QR: {selectedExpired.dropoff_qr_code}
                                </p>
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
                                    disabled={submitting}
                                    onClick={handleRetrieve}
                                    className="gap-1.5"
                                >
                                    <CheckCircle2 className="size-4" />
                                    {submitting ? 'Confirming...' : 'Mark as Retrieved'}
                                </Button>
                            </SlidingDrawerFooter>
                        </>
                    )}
                </SlidingDrawerContent>
            </SlidingDrawer>
        </>
    );
}

Returns.layout = {
    breadcrumbs: [
        {
            title: 'Returns',
            href: staff.returns().url,
        },
    ],
};
