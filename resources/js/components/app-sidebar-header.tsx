import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import student from '@/routes/student';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props;
    const roles = auth.user?.roles || [];
    const isAdmin = roles.includes('admin');
    const isStudent = roles.includes('student') || !isAdmin;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {isStudent && (
                <div className="flex items-center gap-4">
                    <Link
                        href={student.cart().url}
                        className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </Link>
                    <Link
                        href={student.messages().url}
                        className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
                        aria-label="Messages"
                    >
                        <MessageCircle className="h-5 w-5" />
                    </Link>
                </div>
            )}
        </header>
    );
}
