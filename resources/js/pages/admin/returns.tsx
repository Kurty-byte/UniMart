import { Head } from '@inertiajs/react';
import admin from '@/routes/admin';

export default function AdminReturns() {
    return (
        <>
            <Head title="Returns" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Returns</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Returns.</p>
                </div>
            </div>
        </>
    );
}

AdminReturns.layout = {
    breadcrumbs: [
        {
            title: 'Returns',
            href: admin.returns().url,
        },
    ],
};
