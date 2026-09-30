import { Head } from '@inertiajs/react';
import student from '@/routes/student';

export default function StudentMessages() {
    return (
        <>
            <Head title="Messages" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Messages</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Messages.</p>
                </div>
            </div>
        </>
    );
}

StudentMessages.layout = {
    breadcrumbs: [
        {
            title: 'Messages',
            href: student.messages().url,
        },
    ],
};
