import { Head } from '@inertiajs/react';
import staff from '@/routes/staff';

export default function DrawerCount() {
    return (
        <>
            <Head title="Drawer Count" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Drawer Count</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Drawer Count.</p>
                </div>
            </div>
        </>
    );
}

DrawerCount.layout = {
    breadcrumbs: [
        {
            title: 'Drawer Count',
            href: staff.drawerCount().url,
        },
    ],
};
