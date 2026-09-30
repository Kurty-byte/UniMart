import { useAppearance } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ position, ...props }: ToasterProps) {
    const { appearance } = useAppearance();
    const isMobile = useIsMobile();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position={isMobile ? 'top-center' : (position ?? 'bottom-right')}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
