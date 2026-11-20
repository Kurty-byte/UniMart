import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    ItemDetailDrawer,
    type ListingDetailItem,
} from '@/components/item-detail-drawer';
import student from '@/routes/student';

interface ShowProps {
    item: ListingDetailItem;
}

export default function ShowListing({ item }: ShowProps) {
    const [open, setOpen] = useState(true);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            router.visit(student.listings.index().url);
        }
    };

    return (
        <>
            <Head title={`${item.title} - Listing Details`} />

            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                    <Package className="size-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {item.title}
                </h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    View the consignment status, inspection notes, and drop-off QR voucher for this listing.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="gap-2"
                    >
                        <Package className="size-4" />
                        Open Listing Details
                    </Button>
                    <Link
                        href={student.listings.index().url}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to My Listings
                    </Link>
                </div>
            </div>

            <ItemDetailDrawer
                open={open}
                onOpenChange={handleOpenChange}
                item={item}
            />
        </>
    );
}

ShowListing.layout = {
    breadcrumbs: [
        {
            title: 'My Listings',
            href: student.listings.index().url,
        },
        {
            title: 'Listing Details',
            href: '#',
        },
    ],
};
