import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-marine-900 via-deep-indigo-950 to-abyssal-midnight" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-ocean-teal-500/20 via-transparent to-transparent" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium text-white"
                >
                    <div className="mr-3 flex size-9 items-center justify-center rounded-xl bg-seafoam-aqua text-abyssal-midnight shadow-md">
                        <AppLogoIcon className="size-6 fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">{name}</span>
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                            <AppLogoIcon className="size-7 fill-current" />
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
