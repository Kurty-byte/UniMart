import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    Bell,
    Calculator,
    Compass,
    DollarSign,
    Flag,
    Heart,
    LayoutGrid,
    List,
    LogOut,
    Menu,
    MessageCircle,
    Package,
    PackageCheck,
    Palette,
    PlusCircle,
    QrCode,
    Settings,
    Shield,
    ShieldCheck,
    ShoppingCart,
    Tag,
    Tags,
    Undo2,
    User as UserIcon,
    Users,
    Wallet,
} from 'lucide-react';
import {
    SlidingDrawer,
    SlidingDrawerContent,
    SlidingDrawerDescription,
    SlidingDrawerHeader,
    SlidingDrawerTitle,
    SlidingDrawerTrigger,
} from '@/components/ui/sliding-drawer';
import { LogoutConfirmationDialog } from '@/components/logout-confirmation-dialog';
import { UserInfo } from '@/components/user-info';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editPayout } from '@/routes/payout';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import staff from '@/routes/staff';
import student from '@/routes/student';
import {
    PostItemDrawer,
    type CategoryNode,
    type ConditionOption,
} from '@/components/post-item-drawer';
import type { NavItem } from '@/types';

export function AppBottomNav() {
    const {
        auth,
        listingCategories,
        listingConditions,
        unreadMessagesCount = 0,
        unreadNotificationsCount = 0,
        cartSummary,
    } = usePage().props;
    const [openSell, setOpenSell] = useState(false);
    const [openMore, setOpenMore] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const cleanup = useMobileNavigation();

    const roles = auth.user?.roles || [];
    const isAdmin = roles.includes('admin');
    const isStaff = roles.includes('staff') && !isAdmin;
    const isStudent = roles.includes('student') || (!isAdmin && !isStaff);

    const studentBottomTabs: NavItem[] = [
        { title: 'Browse', href: student.browse().url, icon: Compass },
        { title: 'Pickups', href: student.claims().url, icon: PackageCheck },
        { title: 'Sell', href: student.listings.create().url, icon: PlusCircle },
        { title: 'Saved', href: student.saved().url, icon: Heart },
    ];

    const staffBottomTabs: NavItem[] = [
        { title: 'Scanner', href: staff.scan().url, icon: QrCode },
        { title: 'Drop-Offs', href: staff.dropOffs().url, icon: Package },
        { title: 'Claims', href: staff.claims().url, icon: PackageCheck },
        { title: 'Payouts', href: staff.payouts().url, icon: Banknote },
    ];

    const adminBottomTabs: NavItem[] = [
        { title: 'Dashboard', href: dashboard().url, icon: LayoutGrid },
        { title: 'Scanner', href: staff.scan().url, icon: QrCode },
        { title: 'Drop-Offs', href: staff.dropOffs().url, icon: Package },
        { title: 'Claims', href: staff.claims().url, icon: PackageCheck },
    ];

    const studentMoreSeller: NavItem[] = [
        { title: 'My Listings', href: student.listings.index().url, icon: Tag },
        { title: 'Sales', href: student.sales().url, icon: DollarSign },
        { title: 'Payouts', href: student.payouts().url, icon: Banknote },
        { title: 'Returns', href: student.returns().url, icon: Undo2 },
    ];

    const studentMoreShopping: NavItem[] = [
        {
            title: 'Cart',
            href: student.cart().url,
            icon: ShoppingCart,
            badge: cartSummary?.itemsCount || undefined,
        },
        {
            title: 'Messages',
            href: student.messages().url,
            icon: MessageCircle,
            badge: unreadMessagesCount || undefined,
        },
        {
            title: 'Notifications',
            href: student.notifications().url,
            icon: Bell,
            badge: unreadNotificationsCount || undefined,
        },
        { title: 'My Reports', href: student.reports.index().url, icon: Flag },
    ];

    const staffMoreOperations: NavItem[] = [
        { title: 'Returns', href: staff.returns().url, icon: Undo2 },
        { title: 'Drawer Count', href: staff.drawerCount().url, icon: Calculator },
    ];

    const adminMoreWarehouse: NavItem[] = [
        { title: 'Inventory', href: admin.inventory().url, icon: List },
        { title: 'Categories', href: admin.categories().url, icon: Tags },
        { title: 'Users', href: admin.users().url, icon: Users },
        { title: 'Staff & Perms', href: admin.staff.index().url, icon: ShieldCheck },
        { title: 'Reports', href: admin.reports.index().url, icon: Flag },
        { title: 'System Timers', href: admin.settings().url, icon: Settings },
    ];

    const adminMoreOperations: NavItem[] = [
        { title: 'Returns', href: staff.returns().url, icon: Undo2 },
        { title: 'Payouts', href: staff.payouts().url, icon: Banknote },
        { title: 'Drawer Count', href: staff.drawerCount().url, icon: Calculator },
        { title: 'Shift Audits', href: admin.shiftAudits().url, icon: DollarSign },
        { title: 'Finances', href: admin.finances().url, icon: DollarSign },
    ];

    const settingsItems: NavItem[] = [
        { title: 'Profile', href: editProfile(), icon: UserIcon },
        { title: 'Payout', href: editPayout(), icon: Wallet },
        { title: 'Security', href: editSecurity(), icon: Shield },
        { title: 'Appearance', href: editAppearance(), icon: Palette },
    ];

    const currentBottomTabs = isAdmin
        ? adminBottomTabs
        : isStaff
          ? staffBottomTabs
          : studentBottomTabs;

    const isTabActive = (item: NavItem) => isCurrentUrl(item.href);

    const isAnyMoreItemActive = () => {
        if (isAdmin) {
            return (
                adminMoreWarehouse.some((item) => isCurrentUrl(item.href)) ||
                adminMoreOperations.some((item) => isCurrentUrl(item.href)) ||
                settingsItems.some((item) => isCurrentOrParentUrl(item.href))
            );
        }

        if (isStaff) {
            return (
                staffMoreOperations.some((item) => isCurrentUrl(item.href)) ||
                settingsItems.some((item) => isCurrentOrParentUrl(item.href))
            );
        }

        return (
            studentMoreSeller.some((item) => isCurrentUrl(item.href)) ||
            studentMoreShopping.some((item) => isCurrentUrl(item.href)) ||
            settingsItems.some((item) => isCurrentOrParentUrl(item.href))
        );
    };

    const handleNavigate = () => {
        setOpenMore(false);
        cleanup();
    };

    const renderGridLink = (item: NavItem) => {
        const Icon = item.icon;
        const active = isCurrentUrl(item.href);
        return (
            <Link
                key={item.title}
                href={item.href}
                onClick={handleNavigate}
                prefetch
                className={cn(
                    'flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs font-medium transition-colors',
                    active
                        ? 'border-ocean-teal-600/50 bg-ocean-teal/10 text-ocean-teal-700 dark:border-seafoam-aqua/50 dark:bg-seafoam-aqua/10 dark:text-seafoam-aqua'
                        : 'border-border/60 hover:bg-muted/50 text-foreground',
                )}
            >
                <span className="flex items-center gap-2 min-w-0">
                    {Icon && <Icon className="h-4 w-4 shrink-0 opacity-80" />}
                    <span className="truncate">{item.title}</span>
                </span>
                {item.badge !== undefined && Number(item.badge) > 0 && (
                    <span className="inline-flex min-w-4 h-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-bold text-primary shrink-0">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <nav
            aria-label="Mobile bottom navigation"
            className="fixed bottom-0 inset-x-0 z-40 block md:hidden bg-background/95 backdrop-blur-md border-t border-border/80 pb-[env(safe-area-inset-bottom)] shadow-lg"
        >
            <div className="flex h-16 items-center justify-around px-1">
                {currentBottomTabs.map((tab) => {
                    const active = isTabActive(tab);
                    const Icon = tab.icon;

                    if (tab.title === 'Sell') {
                        const isSellActive = openSell;

                        return (
                            <button
                                key={tab.title}
                                type="button"
                                onClick={() => {
                                    cleanup();
                                    setOpenSell(true);
                                }}
                                className={cn(
                                    'flex flex-1 flex-col items-center justify-center py-2 px-1 text-[11px] font-medium transition-colors relative cursor-pointer',
                                    isSellActive
                                        ? 'text-ocean-teal-600 dark:text-seafoam-aqua font-semibold'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                                aria-label="Sell an item"
                            >
                                {isSellActive && (
                                    <span className="absolute top-0 w-8 h-0.5 rounded-full bg-ocean-teal-600 dark:bg-seafoam-aqua" />
                                )}
                                {Icon && <Icon className="h-5 w-5 mb-0.5 shrink-0" aria-hidden="true" />}
                                <span className="truncate max-w-[64px]">{tab.title}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={tab.title}
                            href={tab.href}
                            prefetch
                            onClick={cleanup}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center py-2 px-1 text-[11px] font-medium transition-colors relative',
                                active
                                    ? 'text-ocean-teal-600 dark:text-seafoam-aqua font-semibold'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {active && (
                                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-ocean-teal-600 dark:bg-seafoam-aqua" />
                            )}
                            {Icon && <Icon className="h-5 w-5 mb-0.5 shrink-0" aria-hidden="true" />}
                            <span className="truncate max-w-[64px]">{tab.title}</span>
                        </Link>
                    );
                })}

                {/* 5th Tab: More */}
                <SlidingDrawer open={openMore} onOpenChange={setOpenMore}>
                    <SlidingDrawerTrigger asChild>
                        <button
                            type="button"
                            aria-expanded={openMore}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center py-2 px-1 text-[11px] font-medium transition-colors relative cursor-pointer',
                                isAnyMoreItemActive()
                                    ? 'text-ocean-teal-600 dark:text-seafoam-aqua font-semibold'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                            aria-label="More navigation options"
                        >
                            {isAnyMoreItemActive() && (
                                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-ocean-teal-600 dark:bg-seafoam-aqua" />
                            )}
                            <span className="relative">
                                <Menu className="h-5 w-5 mb-0.5 shrink-0" aria-hidden="true" />
                                {isStudent &&
                                    unreadMessagesCount + unreadNotificationsCount > 0 && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute -top-0.5 -right-1 size-2 rounded-full bg-destructive ring-2 ring-background"
                                        />
                                    )}
                            </span>
                            <span className="truncate max-w-[64px]">More</span>
                        </button>
                    </SlidingDrawerTrigger>
                    <SlidingDrawerContent responsive={false} className="space-y-6">
                        <SlidingDrawerHeader>
                            <SlidingDrawerTitle icon={Menu}>Menu & Account</SlidingDrawerTitle>
                            <SlidingDrawerDescription>
                                Quick navigation, settings, and hub operations.
                            </SlidingDrawerDescription>
                        </SlidingDrawerHeader>

                        {auth.user && (
                            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 border border-border/60">
                                <div className="flex items-center gap-3">
                                    <UserInfo user={auth.user} showEmail={true} />
                                </div>
                                <Link
                                    href={editProfile()}
                                    onClick={handleNavigate}
                                    prefetch
                                    className="text-xs font-medium text-ocean-teal-600 dark:text-seafoam-aqua hover:underline shrink-0"
                                >
                                    View
                                </Link>
                            </div>
                        )}

                        {isStudent && (
                            <>
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                        Seller Hub
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {studentMoreSeller.map(renderGridLink)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                        Shopping & Communication
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {studentMoreShopping.map(renderGridLink)}
                                    </div>
                                </div>
                            </>
                        )}

                        {isStaff && (
                            <div className="space-y-2">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                    Counter & Shift
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {staffMoreOperations.map(renderGridLink)}
                                </div>
                            </div>
                        )}

                        {isAdmin && (
                            <>
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                        Warehouse & Management
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {adminMoreWarehouse.map(renderGridLink)}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                        Financials & Operations
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {adminMoreOperations.map(renderGridLink)}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                Settings & Account
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {settingsItems.map((item) => {
                                    const active = isCurrentOrParentUrl(item.href);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            onClick={handleNavigate}
                                            prefetch
                                            className={cn(
                                                'flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-colors',
                                                active
                                                    ? 'border-ocean-teal-600/50 bg-ocean-teal/10 text-ocean-teal-700 dark:border-seafoam-aqua/50 dark:bg-seafoam-aqua/10 dark:text-seafoam-aqua'
                                                    : 'border-border/60 hover:bg-muted/50 text-foreground',
                                            )}
                                        >
                                            {Icon && (
                                                <Icon
                                                    className="h-4 w-4 shrink-0 opacity-80"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <span className="truncate">{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/60">
                            <button
                                type="button"
                                onClick={() => {
                                    setOpenMore(false);
                                    setShowLogoutDialog(true);
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 p-2.5 text-sm font-medium transition-colors cursor-pointer"
                                data-test="bottom-nav-logout-button"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Log out</span>
                            </button>
                        </div>
                    </SlidingDrawerContent>
                </SlidingDrawer>

                <LogoutConfirmationDialog
                    open={showLogoutDialog}
                    onOpenChange={setShowLogoutDialog}
                />

                {isStudent && (
                    <PostItemDrawer
                        open={openSell}
                        onOpenChange={setOpenSell}
                        categories={(listingCategories as CategoryNode[]) || []}
                        conditions={(listingConditions as ConditionOption[]) || []}
                    />
                )}
            </div>
        </nav>
    );
}
