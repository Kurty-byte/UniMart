import { Head } from '@inertiajs/react';
import staff from '@/routes/staff';

export default function AdminPayouts() {
    return (
        <>
            <Head title="Payouts" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Payouts</h2>
                    <p className="text-muted-foreground mt-2">Redirected to staff desk operations.</p>
                </div>
            </div>
        </>
    );
}

AdminPayouts.layout = {
    breadcrumbs: [
        {
            title: 'Payouts',
            href: staff.payouts().url,
        },
    ],
};
