import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-marine-900 via-deep-indigo-950 to-abyssal-midnight" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-ocean-teal-500/20 via-transparent to-transparent" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3 text-lg font-medium text-white group"
                >
                    <AppLogoIcon className="size-11 object-contain transition-transform duration-300 group-hover:scale-105" />
                    <div className="flex flex-col text-left">
                        <span className="text-xl font-black tracking-tight text-white font-sans leading-none">
                            Uni<span className="text-golden-sand">Mart</span>
                        </span>
                        <span className="text-[10px] font-bold tracking-wider text-white/70 uppercase leading-none mt-1">
                            Campus Hub
                        </span>
                    </div>
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-3 lg:hidden"
                    >
                        <AppLogoIcon className="size-11 object-contain" />
                        <div className="flex flex-col text-left">
                            <span className="text-xl font-black tracking-tight text-foreground font-sans leading-none">
                                Uni<span className="text-golden-sand">Mart</span>
                            </span>
                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase leading-none mt-1">
                                Campus Hub
                            </span>
                        </div>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
