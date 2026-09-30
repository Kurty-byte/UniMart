import { Head } from '@inertiajs/react';
import student from '@/routes/student';

export default function ListingsCreate() {
    return (
        <>
            <Head title="Create Listing" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Create Listing</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Create Listing.</p>
                </div>
            </div>
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
