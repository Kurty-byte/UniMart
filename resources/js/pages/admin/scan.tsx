import { Head } from '@inertiajs/react';
import admin from '@/routes/admin';

export default function Scan() {
    return (
        <>
            <Head title="Admin Scanner" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Admin Scanner</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Admin Scanner.</p>
                </div>
            </div>
        </>
    );
}

Scan.layout = {
    breadcrumbs: [
        {
            title: 'Admin Scanner',
            href: admin.scan().url,
        },
    ],
};
