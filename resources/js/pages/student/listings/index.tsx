import { Head } from '@inertiajs/react';
import student from '@/routes/student';

export default function ListingsIndex() {
    return (
        <>
            <Head title="My Listings" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">My Listings</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for My Listings.</p>
                </div>
            </div>
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
