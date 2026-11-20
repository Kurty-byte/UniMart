import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';
import { DropoffQrVoucher } from '@/components/dropoff-qr-voucher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    SlidingDrawer,
    SlidingDrawerContent,
    SlidingDrawerHeader,
    SlidingDrawerTitle,
} from '@/components/ui/sliding-drawer';
import { formatPeso } from '@/lib/utils';
import student from '@/routes/student';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Package,
    Pencil,
    Tag,
    Trash2,
} from 'lucide-react';

export interface ListingDetailItem {
    id: number;
    title: string;
    description?: string;
    condition: string;
    price: string;
    quantity: number;
    status: string;
    image_urls: string[];
    category: {
        id: number;
        name: string;
    } | null;
    dropoff_qr_code: string | null;
    dropoff_qr_code_svg: string | null;
    shelf_location: string | null;
    rejection_reason?: string | null;
    dropped_off_at?: string | null;
    shelf_expires_at?: string | null;
    created_at?: string | null;
}

interface ItemDetailDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: ListingDetailItem | null;
}

const conditionLabels: Record<string, string> = {
    new: 'Brand New',
    like_new: 'Like New',
    used: 'Used',
};

const statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
    pending_dropoff: {
        label: 'Pending Hub Drop-off',
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
        label: 'Drop-off Rejected',
        variant: 'destructive',
    },
    expired: {
        label: 'Shelf Expired',
        variant: 'outline',
        className: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    },
    retrieved: {
        label: 'Retrieved by Seller',
        variant: 'secondary',
    },
};

export function ItemDetailDrawer({
    open,
    onOpenChange,
    item,
}: ItemDetailDrawerProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    if (!item) return null;

    const statusInfo = statusConfig[item.status] || {
        label: item.status,
        variant: 'outline',
    };

    const handleConfirmDelete = () => {
        setIsDeleting(true);
        router.delete(student.listings.destroy({ item: item.id }).url, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteConfirmOpen(false);
                onOpenChange(false);
            },
        });
    };

    return (
        <>
        <SlidingDrawer open={open} onOpenChange={onOpenChange}>
            <SlidingDrawerContent
                maxHeight="90vh"
                desktopWidth="xl"
            >
                <SlidingDrawerHeader
                    icon={Package}
                    title="Listing Details"
                    description="Specifications, consignment status, and drop-off verification."
                />

                {/* Listing Overview Card with Title, Badges, and Actions */}
                <div className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant={statusInfo.variant}
                                className={`text-xs ${statusInfo.className || ''}`}
                            >
                                {statusInfo.label}
                            </Badge>
                            {item.category && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                    <Tag className="size-3" />
                                    {item.category.name}
                                </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                                {conditionLabels[item.condition] || item.condition}
                            </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                            {item.title}
                        </h3>
                    </div>

                    {item.status === 'pending_dropoff' && (
                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                            >
                                <Link href={student.listings.edit({ item: item.id }).url}>
                                    <Pencil className="mr-1.5 size-3.5" />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteConfirmOpen(true)}
                                disabled={isDeleting}
                                className="h-8 text-xs"
                            >
                                <Trash2 className="mr-1.5 size-3.5" aria-hidden="true" />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-4 space-y-6">
                    {/* Rejection Alert if rejected */}
                    {item.status === 'rejected' && (
                        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive text-xs">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <div>
                                <h4 className="font-semibold">Drop-off Inspection Rejected</h4>
                                <p className="mt-1">
                                    Staff reason: {item.rejection_reason || 'Item condition did not meet requirements.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Drop-off QR Voucher if pending dropoff or expired */}
                    {item.dropoff_qr_code &&
                        (item.status === 'pending_dropoff' || item.status === 'expired') && (
                            <DropoffQrVoucher
                                code={item.dropoff_qr_code}
                                svg={item.dropoff_qr_code_svg}
                                itemTitle={item.title}
                            />
                        )}

                    {/* Image Gallery and Details */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                        {/* Image viewer */}
                        <div className="space-y-2 md:col-span-5">
                            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted">
                                {item.image_urls.length > 0 ? (
                                    <img
                                        src={item.image_urls[selectedImageIndex] || item.image_urls[0]}
                                        alt={item.title}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-muted-foreground">
                                        <Package className="size-12 opacity-30" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {item.image_urls.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {item.image_urls.map((url, idx) => (
                                        <button
                                            type="button"
                                            key={url}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                                selectedImageIndex === idx
                                                    ? 'border-primary ring-2 ring-primary/20'
                                                    : 'border-border opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={url}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="size-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price & Details */}
                        <div className="space-y-4 md:col-span-7">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold text-foreground tabular-nums">
                                    {formatPeso(item.price)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({item.quantity} {item.quantity === 1 ? 'unit' : 'units'} registered)
                                </span>
                            </div>

                            {item.description && (
                                <div className="rounded-lg border border-border/60 bg-muted/30 p-3.5">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Description
                                    </h4>
                                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {item.shelf_location && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Package className="size-4 text-primary" />
                                    <span>Hub Shelf: </span>
                                    <strong className="font-semibold text-foreground">
                                        {item.shelf_location}
                                    </strong>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                                {item.dropped_off_at && (
                                    <div className="flex items-center gap-1">
                                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                                        <span>
                                            Dropped off: {new Date(item.dropped_off_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {item.shelf_expires_at && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="size-3.5 text-amber-600" />
                                        <span>
                                            Shelf Expiry: {new Date(item.shelf_expires_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SlidingDrawerContent>
        </SlidingDrawer>

        <ConfirmActionDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            title={`Delete "${item.title}"?`}
            description="This listing and its uploaded photos will be permanently removed."
            confirmLabel={isDeleting ? 'Deleting...' : 'Delete Listing'}
            processing={isDeleting}
            onConfirm={handleConfirmDelete}
        />
        </>
    );
}
