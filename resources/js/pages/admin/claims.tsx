import { Head } from '@inertiajs/react';
import staff from '@/routes/staff';

export default function AdminClaims() {
    return (
        <>
            <Head title="Claims" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Claims</h2>
                    <p className="text-muted-foreground mt-2">Redirected to staff desk operations.</p>
                </div>
            </div>
        </>
    );
}

AdminClaims.layout = {
    breadcrumbs: [
        {
            title: 'Claims',
            href: staff.claims().url,
        },
    ],
};
