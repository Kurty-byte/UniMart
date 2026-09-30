import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex items-center gap-3 font-medium group"
                        >
                            <AppLogoIcon className="size-12 object-contain transition-transform duration-300 group-hover:scale-105" />
                            <div className="flex flex-col text-left">
                                <span className="text-2xl font-black tracking-tight text-foreground font-sans leading-none">
                                    Uni<span className="text-golden-sand">Mart</span>
                                </span>
                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase leading-none mt-1">
                                    Campus Hub
                                </span>
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
