import { Head } from '@inertiajs/react';
import student from '@/routes/student';

export default function Browse() {
    return (
        <>
            <Head title="Browse" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Browse</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Browse.</p>
                </div>
            </div>
        </>
    );
}

Browse.layout = {
    breadcrumbs: [
        {
            title: 'Browse',
            href: student.browse().url,
        },
    ],
};
