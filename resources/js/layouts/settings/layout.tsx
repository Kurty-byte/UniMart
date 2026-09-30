import { Link } from '@inertiajs/react';
import { Palette, Shield, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
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
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6 md:px-6 md:py-8">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="space-y-6">
                <div className="border-b border-border">
                    <nav
                        className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto"
                        aria-label="Settings navigation"
                    >
                        {navItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        'group inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                                        active
                                            ? 'border-primary text-foreground font-semibold'
                                            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon
                                            className={cn(
                                                'h-4 w-4 transition-colors',
                                                active
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground group-hover:text-foreground',
                                            )}
                                        />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}

