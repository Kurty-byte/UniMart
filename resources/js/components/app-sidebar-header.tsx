import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import staff from '@/routes/staff';
import student from '@/routes/student';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { MessageCircle, ShoppingCart } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props;
    const roles = auth.user?.roles || [];
    const isAdmin = roles.includes('admin');
    const isStaff = roles.includes('staff') && !isAdmin;
    const isStudent = roles.includes('student') || (!isAdmin && !isStaff);
    const homeUrl = isAdmin
        ? dashboard().url
        : isStaff
        ? staff.scan().url
        : student.browse().url;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 hidden md:flex" />
                <Link
                    href={homeUrl}
                    prefetch
                    className="flex md:hidden items-center gap-2.5 -ml-2 mr-1"
                    aria-label="Home"
                >
                    <AppLogoIcon className="size-8 object-contain shrink-0" />
                    <span className="font-black text-base tracking-tight text-foreground font-sans">
                        Uni<span className="text-golden-sand">Mart</span>
                    </span>
                </Link>
                <div className="hidden md:flex">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
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
