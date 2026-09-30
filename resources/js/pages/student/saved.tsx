import { Head } from '@inertiajs/react';
import student from '@/routes/student';

export default function Saved() {
    return (
        <>
            <Head title="Saved Items" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Saved Items</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Saved Items.</p>
                </div>
            </div>
        </>
    );
}

Saved.layout = {
    breadcrumbs: [
        {
            title: 'Saved Items',
            href: student.saved().url,
        },
    ],
};
