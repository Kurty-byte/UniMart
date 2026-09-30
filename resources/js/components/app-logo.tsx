import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <AppLogoIcon className="size-9 object-contain shrink-0" />
            <div className="flex flex-col text-left">
                <span className="text-base font-black tracking-tight text-foreground font-sans leading-none">
                    Uni<span className="text-golden-sand">Mart</span>
                </span>
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase leading-none mt-1">
                    Campus Hub
                </span>
            </div>
        </div>
    );
}
