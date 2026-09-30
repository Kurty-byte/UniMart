import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    alt = 'UniMart Icon',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/unimart-logo.png"
            alt={alt}
            className={cn('object-contain', className)}
            {...props}
        />
    );
}
