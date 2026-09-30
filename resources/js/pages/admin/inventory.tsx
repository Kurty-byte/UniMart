import { Head } from '@inertiajs/react';
import admin from '@/routes/admin';

export default function Inventory() {
    return (
        <>
            <Head title="Inventory" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Inventory</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Inventory.</p>
                </div>
            </div>
        </>
    );
}

Inventory.layout = {
    breadcrumbs: [
        {
            title: 'Inventory',
            href: admin.inventory().url,
        },
    ],
};
