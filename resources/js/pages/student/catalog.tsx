import { Head } from '@inertiajs/react';
import student from '@/routes/student';

export default function Catalog() {
    return (
        <>
            <Head title="Catalog" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Catalog</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Catalog.</p>
                </div>
            </div>
        </>
    );
}

Catalog.layout = {
    breadcrumbs: [
        {
            title: 'Catalog',
            href: student.catalog().url,
        },
    ],
};
