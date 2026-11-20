import { Palette, Settings as SettingsIcon, Shield, User, Wallet } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { InPageNav } from '@/components/ui/in-page-nav';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editPayout } from '@/routes/payout';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const navItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Payout',
        href: editPayout(),
        icon: Wallet,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: Shield,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    return (
        <PageContainer>
            <PageHeader
                icon={SettingsIcon}
                title="Settings"
                description="Manage your profile and account settings"
            />

            <InPageNav items={navItems} ariaLabel="Settings navigation" />

            <div className="w-full max-w-2xl">
                <section className="space-y-8">{children}</section>
            </div>
        </PageContainer>
    );
}
