import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    EditItemDrawer,
    type EditListingItem,
} from '@/components/edit-item-drawer';
import type { CategoryNode, ConditionOption } from '@/components/post-item-drawer';
import student from '@/routes/student';

interface EditListingProps {
    item: EditListingItem;
    categories: CategoryNode[];
    conditions: ConditionOption[];
}

export default function EditListing({
    item,
    categories = [],
    conditions = [],
}: EditListingProps) {
    const [open, setOpen] = useState(true);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            router.visit(student.listings.show({ item: item.id }).url);
        }
    };

    return (
        <>
            <Head title={`Edit ${item.title} - UniMart`} />

            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                    <Pencil className="size-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Edit Item Listing
                </h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Update details, pricing, condition, or photos for your pending drop-off consignment.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="gap-2"
                    >
                        <Pencil className="size-4" />
                        Open Edit Form
                    </Button>
                    <Link
                        href={student.listings.show({ item: item.id }).url}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Listing
                    </Link>
                </div>
            </div>

            <EditItemDrawer
                open={open}
                onOpenChange={handleOpenChange}
                item={item}
                categories={categories}
                conditions={conditions}
            />
        </>
    );
}

EditListing.layout = {
    breadcrumbs: [
        {
            title: 'My Listings',
            href: student.listings.index().url,
        },
        {
            title: 'Edit Listing',
            href: '#',
        },
    ],
};
