import * as React from 'react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function SlidingDrawer({
    ...props
}: React.ComponentProps<typeof Sheet>) {
    return <Sheet data-slot="sliding-drawer" {...props} />;
}

export function SlidingDrawerTrigger({
    ...props
}: React.ComponentProps<typeof SheetTrigger>) {
    return <SheetTrigger data-slot="sliding-drawer-trigger" {...props} />;
}

export function SlidingDrawerClose({
    ...props
}: React.ComponentProps<typeof SheetClose>) {
    return <SheetClose data-slot="sliding-drawer-close" {...props} />;
}

export interface SlidingDrawerDragHandleProps
    extends React.ComponentProps<'div'> {}

export function SlidingDrawerDragHandle({
    className,
    ...props
}: SlidingDrawerDragHandleProps) {
    return (
        <div
            data-slot="sliding-drawer-handle"
            className={cn(
                'mx-auto -mt-2 mb-2 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/20',
                className,
            )}
            {...props}
        />
    );
}

export type SlidingDrawerIcon =
    | React.ComponentType<{ className?: string }>
    | React.ReactNode;

function renderDrawerIcon(
    icon: SlidingDrawerIcon,
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
                className={cn('size-5 text-primary shrink-0', iconClassName)}
            />
        );
    }

    return null;
}

export interface SlidingDrawerTitleProps
    extends React.ComponentProps<typeof SheetTitle> {
    /**
     * Optional icon component or node displayed alongside the title.
     * Rendered with default classes `size-5 text-primary shrink-0`.
     */
    icon?: SlidingDrawerIcon;
    /**
     * Custom class for the icon.
     */
    iconClassName?: string;
}

export function SlidingDrawerTitle({
    className,
    children,
    icon,
    iconClassName,
    ...props
}: SlidingDrawerTitleProps) {
    return (
        <SheetTitle
            data-slot="sliding-drawer-title"
            className={cn(
                'flex items-center gap-2 text-lg font-semibold text-foreground',
                className,
            )}
            {...props}
        >
            {renderDrawerIcon(icon, iconClassName)}
            {children}
        </SheetTitle>
    );
}

export interface SlidingDrawerDescriptionProps
    extends React.ComponentProps<typeof SheetDescription> {}

export function SlidingDrawerDescription({
    className,
    ...props
}: SlidingDrawerDescriptionProps) {
    return (
        <SheetDescription
            data-slot="sliding-drawer-description"
            className={cn('text-xs text-muted-foreground', className)}
            {...props}
        />
    );
}

export interface SlidingDrawerHeaderProps
    extends Omit<React.ComponentProps<typeof SheetHeader>, 'title'> {
    /**
     * Optional title text or node. If provided, renders SlidingDrawerTitle automatically.
     */
    title?: React.ReactNode;
    /**
     * Optional description text or node. If provided, renders SlidingDrawerDescription automatically.
     */
    description?: React.ReactNode;
    /**
     * Optional icon displayed alongside the title when using `title` shorthand.
     */
    icon?: SlidingDrawerIcon;
    /**
     * Custom class for the icon when using `icon` shorthand.
     */
    iconClassName?: string;
}

export function SlidingDrawerHeader({
    className,
    children,
    title,
    description,
    icon,
    iconClassName,
    ...props
}: SlidingDrawerHeaderProps) {
    const hasShorthand = Boolean(title || description);

    return (
        <SheetHeader
            data-slot="sliding-drawer-header"
            className={cn('p-0 text-left space-y-1', className)}
            {...props}
        >
            {hasShorthand ? (
                <>
                    {title && (
                        <SlidingDrawerTitle
                            icon={icon}
                            iconClassName={iconClassName}
                        >
                            {title}
                        </SlidingDrawerTitle>
                    )}
                    {description && (
                        <SlidingDrawerDescription>
                            {description}
                        </SlidingDrawerDescription>
                    )}
                    {children}
                </>
            ) : (
                children
            )}
        </SheetHeader>
    );
}

export function SlidingDrawerFooter({
    className,
    ...props
}: React.ComponentProps<typeof SheetFooter>) {
    return (
        <SheetFooter
            data-slot="sliding-drawer-footer"
            className={cn('p-0 text-left sm:space-x-2', className)}
            {...props}
        />
    );
}

export interface SlidingDrawerContentProps
    extends Omit<React.ComponentProps<typeof SheetContent>, 'side'> {
    /**
     * Whether the drawer responsively adapts:
     * - Mobile (< 768px): bottom slide-up drawer (`side="bottom"`) with drag handle
     * - Desktop (>= 768px): right slide-over sheet (`side="right"`)
     * @default true
     */
    responsive?: boolean;
    /**
     * Desktop drawer side when responsive is true.
     * @default 'right'
     */
    desktopSide?: 'right' | 'left' | 'bottom';
    /**
     * Explicit side override (bypasses responsive switching when provided).
     */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /**
     * Viewport maximum height constraint when bottom-anchored.
     * @default '85vh'
     */
    maxHeight?: '85vh' | '90vh' | 'full' | string;
    /**
     * Maximum width constraint on desktop or centered bottom sheet.
     * @default 'lg'
     */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | 'none';
    /**
     * Dedicated desktop width constraint when side is 'right' or 'left'.
     * Falls back to `maxWidth` if not explicitly provided.
     */
    desktopWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    /**
     * Whether to automatically render the top drag handle indicator on mobile.
     * @default true
     */
    showHandle?: boolean;
    /**
     * Custom class for the drag handle indicator.
     */
    handleClassName?: string;
}

const desktopWidthMap: Record<string, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    full: 'sm:max-w-full',
};

const bottomMaxWidthMap: Record<string, string> = {
    sm: 'max-w-sm mx-auto',
    md: 'max-w-md mx-auto',
    lg: 'max-w-lg mx-auto',
    xl: 'max-w-xl mx-auto',
    '2xl': 'max-w-2xl mx-auto',
    '3xl': 'max-w-3xl mx-auto',
    full: 'max-w-full',
    none: '',
};

const maxHeightMap: Record<string, string> = {
    '85vh': 'max-h-[85vh]',
    '90vh': 'max-h-[90vh]',
    full: 'max-h-screen',
};

export function SlidingDrawerContent({
    className,
    children,
    responsive = true,
    desktopSide = 'right',
    side,
    maxHeight = '85vh',
    maxWidth = 'lg',
    desktopWidth,
    showHandle = true,
    handleClassName,
    style,
    ...props
}: SlidingDrawerContentProps) {
    const isMobile = useIsMobile();
    const activeSide = side ?? (responsive ? (isMobile ? 'bottom' : desktopSide) : 'bottom');
    const isBottom = activeSide === 'bottom';
    const heightClass = maxHeightMap[maxHeight] ?? '';

    const effectiveDesktopWidth = desktopWidth ?? (maxWidth !== 'none' ? maxWidth : 'lg');
    const widthClass = isBottom
        ? bottomMaxWidthMap[maxWidth] ?? ''
        : desktopWidthMap[effectiveDesktopWidth] ?? 'sm:max-w-lg';

    const baseClasses = isBottom
        ? 'w-full rounded-t-2xl overflow-y-auto px-5 py-6 pb-10 border-t'
        : 'h-full overflow-y-auto p-6 border-l';

    return (
        <SheetContent
            side={activeSide}
            data-slot="sliding-drawer-content"
            className={cn(baseClasses, heightClass, widthClass, className)}
            style={
                isBottom && !heightClass && maxHeight
                    ? { maxHeight, ...style }
                    : style
            }
            {...props}
        >
            {isBottom && showHandle && (
                <SlidingDrawerDragHandle className={handleClassName} />
            )}
            {children}
        </SheetContent>
    );
}
