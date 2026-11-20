import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';

export type InPageNavIcon =
    | React.ComponentType<{ className?: string }>
    | LucideIcon
    | React.ReactNode;

export interface InPageNavItem {
    title: React.ReactNode;
    href?: NonNullable<InertiaLinkProps['href']>;
    icon?: InPageNavIcon;
    iconClassName?: string;
    isActive?: boolean;
    exactMatch?: boolean;
    badge?: React.ReactNode;
    disabled?: boolean;
    onClick?: React.MouseEventHandler;
}

function renderNavIcon(
    icon?: InPageNavIcon,
    isActive?: boolean,
    iconClassName?: string,
) {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
        return icon;
    }

    if (
        typeof icon === 'function' ||
        (typeof icon === 'object' && icon !== null && 'render' in icon)
    ) {
        const IconComponent = icon as React.ComponentType<{ className?: string }>;
        return (
            <IconComponent
                className={cn(
                    'size-4 shrink-0 transition-colors',
                    isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground',
                    iconClassName,
                )}
            />
        );
    }

    return null;
}

function renderNavBadge(badge?: React.ReactNode, isActive?: boolean) {
    if (badge === undefined || badge === null || badge === false) return null;

    if (typeof badge === 'number' || typeof badge === 'string') {
        return <InPageNavBadge isActive={isActive}>{badge}</InPageNavBadge>;
    }

    return <span className="inline-flex items-center">{badge}</span>;
}

export interface InPageNavProps extends React.ComponentProps<'div'> {
    items?: InPageNavItem[];
    ariaLabel?: string;
}

export function InPageNav({
    className,
    items,
    children,
    ariaLabel = 'In-page navigation',
    ...props
}: InPageNavProps) {
    const hasTabButtons = Boolean(items?.some((item) => !item.href));

    return (
        <div
            data-slot="in-page-nav"
            className={cn('border-b border-border', className)}
            {...props}
        >
            {items ? (
                <InPageNavList aria-label={ariaLabel} asTabList={hasTabButtons}>
                    {items.map((item, index) => {
                        const key = item.href
                            ? `${toUrl(item.href)}-${index}`
                            : `item-${index}`;

                        if (item.href) {
                            return (
                                <InPageNavLink
                                    key={key}
                                    href={item.href}
                                    icon={item.icon}
                                    iconClassName={item.iconClassName}
                                    isActive={item.isActive}
                                    exactMatch={item.exactMatch}
                                    badge={item.badge}
                                    disabled={item.disabled}
                                    onClick={item.onClick}
                                >
                                    {item.title}
                                </InPageNavLink>
                            );
                        }

                        return (
                            <InPageNavButton
                                key={key}
                                icon={item.icon}
                                iconClassName={item.iconClassName}
                                isActive={item.isActive}
                                badge={item.badge}
                                disabled={item.disabled}
                                onClick={item.onClick}
                            >
                                {item.title}
                            </InPageNavButton>
                        );
                    })}
                </InPageNavList>
            ) : (
                children
            )}
        </div>
    );
}

export interface InPageNavListProps extends React.ComponentProps<'nav'> {
    'aria-label'?: string;
    asTabList?: boolean;
}

export function InPageNavList({
    className,
    children,
    'aria-label': ariaLabel = 'In-page navigation',
    asTabList = false,
    ...props
}: InPageNavListProps) {
    const sharedClassName = cn(
        '-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto scrollbar-none',
        className,
    );

    if (asTabList) {
        return (
            <div
                data-slot="in-page-nav-list"
                role="tablist"
                aria-label={ariaLabel}
                className={sharedClassName}
            >
                {children}
            </div>
        );
    }

    return (
        <nav
            data-slot="in-page-nav-list"
            aria-label={ariaLabel}
            className={sharedClassName}
            {...props}
        >
            {children}
        </nav>
    );
}

export interface InPageNavLinkProps
    extends Omit<InertiaLinkProps, 'href' | 'children'> {
    href: NonNullable<InertiaLinkProps['href']>;
    children?: React.ReactNode;
    icon?: InPageNavIcon;
    iconClassName?: string;
    isActive?: boolean;
    exactMatch?: boolean;
    badge?: React.ReactNode;
    disabled?: boolean;
}

export function InPageNavLink({
    className,
    children,
    href,
    icon,
    iconClassName,
    isActive,
    exactMatch = false,
    badge,
    disabled = false,
    prefetch = true,
    ...props
}: InPageNavLinkProps) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const active =
        isActive !== undefined
            ? isActive
            : exactMatch
            ? isCurrentUrl(href)
            : isCurrentOrParentUrl(href);

    return (
        <Link
            data-slot="in-page-nav-link"
            href={href}
            prefetch={prefetch}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors whitespace-nowrap rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                disabled && 'pointer-events-none opacity-50',
                className,
            )}
            {...props}
        >
            {renderNavIcon(icon, active, iconClassName)}
            {children && <span>{children}</span>}
            {renderNavBadge(badge, active)}
        </Link>
    );
}

export interface InPageNavButtonProps extends React.ComponentProps<'button'> {
    children?: React.ReactNode;
    icon?: InPageNavIcon;
    iconClassName?: string;
    isActive?: boolean;
    badge?: React.ReactNode;
}

export function InPageNavButton({
    className,
    children,
    icon,
    iconClassName,
    isActive = false,
    badge,
    disabled,
    type = 'button',
    ...props
}: InPageNavButtonProps) {
    return (
        <button
            type={type}
            data-slot="in-page-nav-button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            className={cn(
                'group inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                disabled && 'pointer-events-none opacity-50 cursor-not-allowed',
                className,
            )}
            {...props}
        >
            {renderNavIcon(icon, isActive, iconClassName)}
            {children && <span>{children}</span>}
            {renderNavBadge(badge, isActive)}
        </button>
    );
}

export interface InPageNavBadgeProps extends React.ComponentProps<'span'> {
    isActive?: boolean;
}

export function InPageNavBadge({
    className,
    isActive,
    children,
    ...props
}: InPageNavBadgeProps) {
    return (
        <span
            data-slot="in-page-nav-badge"
            className={cn(
                'ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground',
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
