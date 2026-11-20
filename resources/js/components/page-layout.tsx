import type { ComponentProps, ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageContainer({
    className,
    children,
    ...props
}: ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-container"
            className={cn(
                'mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: ComponentType<{ className?: string }>;
    iconClassName?: string;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    iconClassName,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div
            data-slot="page-header"
            className={cn(
                'flex flex-wrap items-center justify-between gap-4',
                className,
            )}
        >
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                    {Icon && (
                        <Icon
                            className={cn(
                                'size-6 shrink-0 text-primary',
                                iconClassName,
                            )}
                            aria-hidden="true"
                        />
                    )}
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
