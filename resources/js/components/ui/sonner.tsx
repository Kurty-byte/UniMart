import { useAppearance } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ position, offset, ...props }: ToasterProps) {
    const { appearance } = useAppearance();
    const isMobile = useIsMobile();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position={isMobile ? 'bottom-center' : (position ?? 'bottom-right')}
            offset={
                offset ??
                (isMobile
                    ? 'calc(5.5rem + env(safe-area-inset-bottom, 0px))'
                    : undefined)
            }
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--offset': isMobile ? 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' : undefined,
                    zIndex: 9999,
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
