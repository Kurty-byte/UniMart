import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    DollarSign,
    Heart,
    LayoutGrid,
    List,
    MessageCircle,
    Package,
    QrCode,
    Search,
    ShieldAlert,
    Shirt,
    Tags,
    Undo2,
    User,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import student from '@/routes/student';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    { title: 'Scanner', href: admin.scan().url, icon: QrCode },
    { title: 'Drop-Offs', href: admin.dropOffs().url, icon: Package },
    { title: 'Claims', href: admin.claims().url, icon: ShieldAlert },
    { title: 'Returns', href: admin.returns().url, icon: Undo2 },
    { title: 'Payouts', href: admin.payouts().url, icon: Banknote },
    { title: 'Finances', href: admin.finances().url, icon: DollarSign },
    { title: 'Inventory', href: admin.inventory().url, icon: List },
    { title: 'Categories', href: admin.categories().url, icon: Tags },
];

const studentNavItems: NavItem[] = [
    { title: 'Catalog', href: student.catalog().url, icon: Search },
    { title: 'Saved Items', href: student.saved().url, icon: Heart },
    { title: 'My Listings', href: student.listings.index().url, icon: Shirt },
    { title: 'Claims', href: student.claims().url, icon: ShieldAlert },
    { title: 'Sales', href: student.sales().url, icon: DollarSign },
    { title: 'Returns', href: student.returns().url, icon: Undo2 },
    { title: 'Payouts', href: student.payouts().url, icon: Banknote },
    { title: 'Messages', href: student.messages().url, icon: MessageCircle },
    { title: 'Profile', href: student.profile().url, icon: User },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const roles = auth.user?.roles || [];

    const isAdmin = roles.includes('admin');
    const isStudent = roles.includes('student') || !isAdmin;

    const homeUrl = isAdmin ? dashboard().url : student.catalog().url;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isAdmin && (
                    <>
                        <NavMain items={mainNavItems} title="Overview" />
                        <NavMain items={adminNavItems} title="Administration" />
                    </>
                )}
                {isStudent && <NavMain items={studentNavItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
