import { Palette, Shield, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { InPageNav } from '@/components/ui/in-page-nav';
import { edit as editAppearance } from '@/routes/appearance';
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
        <div className="px-4 py-6 md:px-6 md:py-8">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="space-y-6">
                <InPageNav items={navItems} ariaLabel="Settings navigation" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}

