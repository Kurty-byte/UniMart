import { Head } from '@inertiajs/react';
import student from '@/routes/student';

export default function StudentClaims() {
    return (
        <>
            <Head title="My Claims" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">My Claims</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for My Claims.</p>
                </div>
            </div>
        </>
    );
}

StudentClaims.layout = {
    breadcrumbs: [
        {
            title: 'My Claims',
            href: student.claims().url,
        },
    ],
};
