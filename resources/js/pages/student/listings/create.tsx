import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    PostItemDrawer,
    type CategoryNode,
    type ConditionOption,
} from '@/components/post-item-drawer';
import student from '@/routes/student';

interface CreateListingProps {
    categories: CategoryNode[];
    conditions: ConditionOption[];
}

export default function ListingsCreate({
    categories,
    conditions,
}: CreateListingProps) {
    const [open, setOpen] = useState(true);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            router.visit(student.listings.index().url);
        }
    };

    return (
        <>
            <Head title="Post Item for Sale - UniMart" />

            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                    <PlusCircle className="size-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Post an Item for Sale
                </h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Register your pre-owned academic gear, uniforms, or textbooks to sell through the Campus Hub.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="gap-2"
                    >
                        <PlusCircle className="size-4" />
                        Open Registration Form
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

            <PostItemDrawer
                open={open}
                onOpenChange={handleOpenChange}
                categories={categories || []}
                conditions={conditions || []}
            />
        </>
    );
}

ListingsCreate.layout = {
    breadcrumbs: [
        {
            title: 'My Listings',
            href: student.listings.index().url,
        },
        {
            title: 'Create Listing',
            href: student.listings.create().url,
        },
    ],
};
