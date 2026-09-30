import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    Calculator,
    Compass,
    DollarSign,
    Heart,
    LayoutGrid,
    List,
    MessageCircle,
    Package,
    PackageCheck,
    PlusCircle,
    QrCode,
    Search,
    Tag,
    Tags,
    Undo2,
    Users,
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
import staff from '@/routes/staff';
import student from '@/routes/student';
import type { NavItem } from '@/types';

const staffOperationsNavItems: NavItem[] = [
    { title: 'Scanner', href: staff.scan().url, icon: QrCode },
    { title: 'Drop-Offs', href: staff.dropOffs().url, icon: Package },
    { title: 'Claims', href: staff.claims().url, icon: PackageCheck },
    { title: 'Returns', href: staff.returns().url, icon: Undo2 },
    { title: 'Payouts', href: staff.payouts().url, icon: Banknote },
];

const staffDrawerNavItems: NavItem[] = [
    { title: 'Drawer Count', href: staff.drawerCount().url, icon: Calculator },
];

const adminOverviewNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard().url, icon: LayoutGrid },
    { title: 'Scanner', href: staff.scan().url, icon: QrCode },
];

const adminOperationsNavItems: NavItem[] = [
    { title: 'Drop-Offs', href: staff.dropOffs().url, icon: Package },
    { title: 'Claims', href: staff.claims().url, icon: PackageCheck },
    { title: 'Returns', href: staff.returns().url, icon: Undo2 },
    { title: 'Payouts', href: staff.payouts().url, icon: Banknote },
];

const adminManagementNavItems: NavItem[] = [
    { title: 'Inventory', href: admin.inventory().url, icon: List },
    { title: 'Categories', href: admin.categories().url, icon: Tags },
    { title: 'Users', href: admin.users().url, icon: Users },
    { title: 'Finances', href: admin.finances().url, icon: DollarSign },
    { title: 'Shift Audits', href: admin.shiftAudits().url, icon: Calculator },
];

const studentMarketplaceNavItems: NavItem[] = [
    { title: 'Browse', href: student.browse().url, icon: Compass },
    { title: 'Saved Items', href: student.saved().url, icon: Heart },
    { title: 'My Pickups', href: student.claims().url, icon: PackageCheck },
];

const studentSellerNavItems: NavItem[] = [
    { title: 'Sell Item', href: student.listings.create().url, icon: PlusCircle },
    { title: 'My Listings', href: student.listings.index().url, icon: Tag },
    { title: 'Sales', href: student.sales().url, icon: DollarSign },
    { title: 'Payouts', href: student.payouts().url, icon: Banknote },
    { title: 'Returns', href: student.returns().url, icon: Undo2 },
];

const studentAccountNavItems: NavItem[] = [
    { title: 'Messages', href: student.messages().url, icon: MessageCircle },
];

export function AppSidebar() {
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
                        <NavMain items={adminOverviewNavItems} title="Overview" />
                        <NavMain items={adminOperationsNavItems} title="Counter Operations" />
                        <NavMain items={adminManagementNavItems} title="Management" />
                    </>
                )}
                {isStaff && (
                    <>
                        <NavMain items={staffOperationsNavItems} title="Counter Operations" />
                        <NavMain items={staffDrawerNavItems} title="Shift & Drawer" />
                    </>
                )}
                {isStudent && (
                    <>
                        <NavMain items={studentMarketplaceNavItems} title="Marketplace" />
                        <NavMain items={studentSellerNavItems} title="Seller Hub" />
                        <NavMain items={studentAccountNavItems} title="Communication" />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
