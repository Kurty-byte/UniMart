import { Head } from '@inertiajs/react';
import admin from '@/routes/admin';

export default function Users() {
    return (
        <>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Users</h2>
                    <p className="text-muted-foreground mt-2">Manage student and administrator accounts.</p>
                </div>
            </div>
        </>
    );
}

Users.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: admin.users().url,
        },
    ],
};
