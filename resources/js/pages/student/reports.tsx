import { Head } from '@inertiajs/react';

export default function StudentReports() {
    return (
        <>
            <Head title="My Reports & Disputes" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">My Reports & Disputes</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track the status of concerns and disputes you have reported to campus administration.
                    </p>
                </div>
            </div>
        </>
    );
}
