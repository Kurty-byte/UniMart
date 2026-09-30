import { Head } from '@inertiajs/react';
import student from '@/routes/student';

export default function Cart() {
    return (
        <>
            <Head title="Cart" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
                    <h2 className="text-xl font-bold">Cart</h2>
                    <p className="text-muted-foreground mt-2">Placeholder page for Cart.</p>
                </div>
            </div>
        </>
    );
}

Cart.layout = {
    breadcrumbs: [
        {
            title: 'Cart',
            href: student.cart().url,
        },
    ],
};
