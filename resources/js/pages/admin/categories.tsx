import { Head } from '@inertiajs/react';
import admin from '@/routes/admin';

export default function Categories() {
    return (
        <>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Categories</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Categories.</p>
                </div>
            </div>
        </>
    );
}

Categories.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: admin.categories().url,
        },
    ],
};
