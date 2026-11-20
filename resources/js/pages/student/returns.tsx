import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    QrCode,
    Undo2,
    XCircle,
} from 'lucide-react';
import { ItemDetailDrawer, type ListingDetailItem } from '@/components/item-detail-drawer';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InPageNav } from '@/components/ui/in-page-nav';
import student from '@/routes/student';

interface ReturnItem extends ListingDetailItem {
    updated_at?: string | null;
}

interface StudentReturnsProps {
    expiredItems: ReturnItem[];
    rejectedItems: ReturnItem[];
    retrievedItems: ReturnItem[];
}

function formatPeso(amount: string | number): string {
    return `₱${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function StudentReturns({
    expiredItems = [],
    rejectedItems = [],
    retrievedItems = [],
}: StudentReturnsProps) {
    const [activeTab, setActiveTab] = useState<'expired' | 'rejected' | 'retrieved'>('expired');
    const [selectedItem, setSelectedItem] = useState<ReturnItem | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const currentItems =
        activeTab === 'expired'
            ? expiredItems
            : activeTab === 'rejected'
              ? rejectedItems
              : retrievedItems;

    return (
        <>
            <Head title="Returns & Retrievals - UniMart" />

            <PageContainer>
                <PageHeader
                    icon={Undo2}
                    title="Returns & Shelf Retrievals"
                    description="Retrieve unsold items whose Hub shelf period has expired, or review rejected drop-offs."
                />

                {expiredItems.length > 0 && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                {expiredItems.length}{' '}
                                {expiredItems.length === 1 ? 'item is' : 'items are'} waiting for retrieval at the Campus Hub.
                            </p>
                            <p className="mt-0.5 opacity-90">
                                Open an expired item below to show its Drop-off / Retrieval QR code to Hub Staff so they can hand your item back.
                            </p>
                        </div>
                    </div>
                )}

                <InPageNav
                    ariaLabel="Returns tabs"
                    items={[
                        {
                            title: 'Awaiting Retrieval',
                            icon: Clock,
                            badge: expiredItems.length,
                            isActive: activeTab === 'expired',
                            onClick: () => setActiveTab('expired'),
                        },
                        {
                            title: 'Rejected Drop-offs',
                            icon: XCircle,
                            badge: rejectedItems.length,
                            isActive: activeTab === 'rejected',
                            onClick: () => setActiveTab('rejected'),
                        },
                        {
                            title: 'Retrieved History',
                            icon: CheckCircle2,
                            badge: retrievedItems.length,
                            isActive: activeTab === 'retrieved',
                            onClick: () => setActiveTab('retrieved'),
                        },
                    ]}
                />

                {currentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Undo2 className="size-7 opacity-50" />
                        </div>
                        <h3 className="mt-4 font-semibold text-foreground">No items in this category</h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            {activeTab === 'expired'
                                ? 'None of your shelved items have expired.'
                                : activeTab === 'rejected'
                                  ? 'None of your drop-offs have been rejected.'
                                  : 'Items you have picked back up from the Hub will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {currentItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs"
                            >
                                <div>
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        {item.image_urls.length > 0 ? (
                                            <img
                                                src={item.image_urls[0]}
                                                alt={item.title}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                                <Package className="size-10 opacity-30" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            {item.status === 'expired' && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-rose-500/40 bg-rose-500/90 text-white text-[10px]"
                                                >
                                                    Shelf Expired
                                                </Badge>
                                            )}
                                            {item.status === 'rejected' && (
                                                <Badge variant="destructive" className="text-[10px]">
                                                    Rejected
                                                </Badge>
                                            )}
                                            {item.status === 'retrieved' && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    Retrieved
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-foreground">
                                                {formatPeso(item.price)}
                                            </span>
                                            {item.shelf_location && (
                                                <span className="inline-flex items-center gap-1 text-ocean-teal dark:text-seafoam-aqua font-medium">
                                                    <MapPin className="size-3" />
                                                    {item.shelf_location}
                                                </span>
                                            )}
                                        </div>
                                        {item.status === 'rejected' && item.rejection_reason && (
                                            <p className="rounded-lg bg-destructive/10 p-2 text-[11px] text-destructive line-clamp-2">
                                                Reason: {item.rejection_reason}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-border p-3">
                                    <Button
                                        type="button"
                                        variant={item.status === 'expired' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setDrawerOpen(true);
                                        }}
                                        className="w-full gap-1.5 text-xs"
                                    >
                                        {item.status === 'expired' ? (
                                            <>
                                                <QrCode className="size-3.5" />
                                                Show Retrieval QR
                                            </>
                                        ) : (
                                            'View Details'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </PageContainer>

            <ItemDetailDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                item={selectedItem}
            />
        </>
    );
}

StudentReturns.layout = {
    breadcrumbs: [
        {
            title: 'Returns',
            href: student.returns().url,
        },
    ],
};
