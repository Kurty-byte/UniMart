import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ItemDetailDrawer, type ListingDetailItem } from '@/components/item-detail-drawer';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { PostItemDrawer, type CategoryNode, type ConditionOption } from '@/components/post-item-drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InPageNav } from '@/components/ui/in-page-nav';
import student from '@/routes/student';
import {
    Clock,
    Package,
    Plus,
    QrCode,
    Tag,
} from 'lucide-react';

interface ListingItem extends ListingDetailItem {}

interface ListingsPagination {
    data: ListingItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface ListingsIndexProps {
    listings: ListingsPagination;
    statusCounts: Record<string, number>;
    currentStatus: string | null;
    categories?: CategoryNode[];
    conditions?: ConditionOption[];
}

const statusTabs = [
    { key: null, label: 'All Listings' },
    { key: 'pending_dropoff', label: 'Pending Drop-off' },
    { key: 'available', label: 'Live in Catalog' },
    { key: 'sold', label: 'Sold' },
    { key: 'expired', label: 'Expired' },
    { key: 'rejected', label: 'Rejected' },
];

const statusBadgeConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
    pending_dropoff: {
        label: 'Pending Drop-off',
        variant: 'outline',
        className: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    available: {
        label: 'Live in Catalog',
        variant: 'default',
        className: 'bg-emerald-600 text-white',
    },
    sold: {
        label: 'Sold',
        variant: 'secondary',
    },
    rejected: {
        label: 'Rejected',
        variant: 'destructive',
    },
    expired: {
        label: 'Shelf Expired',
        variant: 'outline',
        className: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    },
    retrieved: {
        label: 'Retrieved',
        variant: 'secondary',
    },
};

export default function ListingsIndex({
    listings,
    statusCounts,
    currentStatus,
    categories,
    conditions,
}: ListingsIndexProps) {
    const totalCount = Object.values(statusCounts).reduce((acc, count) => acc + count, 0);

    const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ListingDetailItem | null>(null);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

    const handleOpenDetail = (item: ListingDetailItem) => {
        setSelectedItem(item);
        setDetailDrawerOpen(true);
    };

    const handleFilterStatus = (statusKey: string | null) => {
        router.get(
            student.listings.index().url,
            statusKey ? { status: statusKey } : {},
            { preserveState: true }
        );
    };

    return (
        <>
            <Head title="My Listings - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={Tag}
                    title="My Listings"
                    description="Manage the academic items, gear, and textbooks you've registered for consignment."
                    actions={
                        <Button
                            type="button"
                            onClick={() => setCreateDrawerOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="size-4" />
                            Post New Item
                        </Button>
                    }
                />

                {/* Status Filter Tabs */}
                <InPageNav
                    ariaLabel="Listing status navigation"
                    items={statusTabs.map((tab) => {
                        const count = tab.key ? statusCounts[tab.key] ?? 0 : totalCount;
                        const isActive = currentStatus === tab.key || (!currentStatus && tab.key === null);

                        return {
                            title: tab.label,
                            isActive,
                            badge: count,
                            onClick: () => handleFilterStatus(tab.key),
                        };
                    })}
                />

                {/* Listings Grid */}
                {listings.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Package className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No listings found</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            {currentStatus
                                ? `You don't have any items under "${statusBadgeConfig[currentStatus]?.label || currentStatus}".`
                                : "You haven't posted any items for sale yet. Turn your unused PE gear or books into cash!"}
                        </p>
                        <Button
                            type="button"
                            onClick={() => setCreateDrawerOpen(true)}
                            className="mt-5 gap-2"
                            size="sm"
                        >
                            <Plus className="size-4" />
                            Post an Item Now
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.data.map((item) => {
                            const badge = statusBadgeConfig[item.status] || {
                                label: item.status,
                                variant: 'outline',
                            };

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs transition hover:shadow-md"
                                >
                                    {/* Thumbnail & Badges */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        {item.image_urls.length > 0 ? (
                                            <img
                                                src={item.image_urls[0]}
                                                alt={item.title}
                                                className="size-full object-cover transition hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                                <Package className="size-10 opacity-30" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 flex gap-1.5">
                                            <Badge
                                                variant={badge.variant}
                                                className={`text-[10px] ${badge.className || ''}`}
                                            >
                                                {badge.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex flex-1 flex-col justify-between p-4">
                                        <div className="space-y-2">
                                            {item.category && (
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Tag className="size-3" />
                                                    <span>{item.category.name}</span>
                                                </div>
                                            )}
                                            <h3 className="line-clamp-2 font-semibold text-foreground text-sm">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-baseline justify-between pt-1">
                                                <span className="font-extrabold text-foreground text-base">
                                                    ₱{Number(item.price).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action footer */}
                                        <div className="mt-4 border-t border-border pt-3">
                                            {item.status === 'pending_dropoff' ? (
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleOpenDetail(item)}
                                                    className="w-full gap-2 text-xs"
                                                >
                                                    <QrCode className="size-3.5" />
                                                    View Drop-off QR
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDetail(item)}
                                                    className="w-full text-xs"
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

            {/* Slide-Up Drawers for Post New Item and View Details */}
            <PostItemDrawer
                open={createDrawerOpen}
                onOpenChange={setCreateDrawerOpen}
                categories={categories || []}
                conditions={conditions || []}
                onSuccess={() => {
                    router.reload({ only: ['listings', 'statusCounts'] });
                }}
            />

            <ItemDetailDrawer
                open={detailDrawerOpen}
                onOpenChange={setDetailDrawerOpen}
                item={selectedItem}
            />
        </>
    );
}

ListingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'My Listings',
            href: student.listings.index().url,
        },
    ],
};
