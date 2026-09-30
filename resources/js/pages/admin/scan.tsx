import { Head } from '@inertiajs/react';
import staff from '@/routes/staff';

export default function AdminScan() {
    return (
        <>
            <Head title="Admin Scanner" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Admin Scanner</h2>
                    <p className="text-muted-foreground mt-2">Redirected to staff desk scanner.</p>
                </div>
            </div>
        </>
    );
}

AdminScan.layout = {
    breadcrumbs: [
        {
            title: 'Staff Scanner',
            href: staff.scan().url,
        },
    ],
};
