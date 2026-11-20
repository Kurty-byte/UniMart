import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    CatalogItemDrawer,
    type CatalogDetailItem,
} from '@/components/catalog-item-drawer';
import student from '@/routes/student';

interface ItemDetailProps {
    item: CatalogDetailItem;
    isOwn: boolean;
    canAddToCart: boolean;
    inCartQuantity?: number;
}

export default function ItemDetail({
    item,
    isOwn,
    canAddToCart,
    inCartQuantity = 0,
}: ItemDetailProps) {
    const [open, setOpen] = useState(true);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            if (typeof window !== 'undefined') {
                const fromBrowse = sessionStorage.getItem('unimart:fromBrowse');
                if (fromBrowse) {
                    sessionStorage.removeItem('unimart:fromBrowse');
                    if (window.history.length > 1) {
                        window.history.back();
                        return;
                    }
                    router.visit(fromBrowse);
                    return;
                }
            }
            router.visit(student.browse().url);
        }
    };

    return (
        <>
            <Head title={`${item.title} - Campus Catalog`} />

            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                    <ShoppingBag className="size-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {item.title}
                </h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    View item specifications, condition, and purchase from the Campus Hub catalog.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="gap-2"
                    >
                        <ShoppingBag className="size-4" />
                        Open Item Details
                    </Button>
                    <Link
                        href={student.browse().url}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Catalog
                    </Link>
                </div>
            </div>

            <CatalogItemDrawer
                open={open}
                onOpenChange={handleOpenChange}
                item={item}
                isOwn={isOwn}
                canAddToCart={canAddToCart}
                inCartQuantity={inCartQuantity}
            />
        </>
    );
}

ItemDetail.layout = {
    breadcrumbs: [
        {
            title: 'Browse',
            href: student.browse().url,
        },
        {
            title: 'Item Details',
            href: '#',
        },
    ],
};
