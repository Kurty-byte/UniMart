import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import staff from '@/routes/staff';
import student from '@/routes/student';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, MessageCircle, ShoppingCart } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const {
        auth,
        unreadMessagesCount = 0,
        unreadNotificationsCount = 0,
        cartSummary,
        hasOpenShift = false,
    } = usePage().props;
    const roles = auth.user?.roles || [];
    const isAdmin = roles.includes('admin');
    const isStaff = roles.includes('staff') && !isAdmin;
    const isStudent = roles.includes('student') || (!isAdmin && !isStaff);
    const homeUrl = isAdmin
        ? dashboard().url
        : isStaff
          ? staff.scan().url
          : student.browse().url;

    const cartCount = cartSummary?.itemsCount ?? 0;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
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
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Link
                        href={student.cart().url}
                        className="relative inline-flex size-10 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground transition-colors md:size-9"
                        aria-label={
                            cartCount > 0
                                ? `Cart (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`
                                : 'Cart'
                        }
                    >
                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                        {cartCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-ocean-teal-600 px-1 text-[10px] font-bold text-white tabular-nums">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href={student.messages().url}
                        className="relative inline-flex size-10 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground transition-colors md:size-9"
                        aria-label={
                            unreadMessagesCount > 0
                                ? `Messages (${unreadMessagesCount} unread)`
                                : 'Messages'
                        }
                    >
                        <MessageCircle className="h-5 w-5" aria-hidden="true" />
                        {unreadMessagesCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground tabular-nums">
                                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href={student.notifications().url}
                        className="relative inline-flex size-10 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground transition-colors md:size-9"
                        aria-label={
                            unreadNotificationsCount > 0
                                ? `Notifications (${unreadNotificationsCount} unread)`
                                : 'Notifications'
                        }
                    >
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground tabular-nums">
                                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                            </span>
                        )}
                    </Link>
                </div>
            )}

            {(isStaff || isAdmin) && (
                <Link href={staff.drawerCount().url} prefetch>
                    {hasOpenShift ? (
                        <Badge
                            variant="outline"
                            className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs"
                        >
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Shift Open
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs"
                        >
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            No Active Shift
                        </Badge>
                    )}
                </Link>
            )}
        </header>
    );
}
