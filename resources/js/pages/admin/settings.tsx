import { Head, useForm } from '@inertiajs/react';
import { Clock, Info, Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PageContainer, PageHeader } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

interface AdminSettingsProps {
    settings: {
        cart_soft_hold_minutes: number;
        order_hard_hold_hours: number;
        item_shelf_expiry_days: number;
    };
}

export default function Settings({ settings }: AdminSettingsProps) {
    const { data, setData, put, processing, errors } = useForm({
        cart_soft_hold_minutes: settings.cart_soft_hold_minutes,
        order_hard_hold_hours: settings.order_hard_hold_hours,
        item_shelf_expiry_days: settings.item_shelf_expiry_days,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(admin.settings.update().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('System timers updated and logged in the Hub audit trail.');
            },
            onError: () => {
                toast.error('Please verify the allowed timer ranges.');
            },
        });
    };

    return (
        <>
            <Head title="System Timers - UniMart Admin" />

            <PageContainer>
                <PageHeader
                    icon={SettingsIcon}
                    title="System Timers & Inventory Flow"
                    description="Configure two-stage reservation durations and Hub shelf expiration limits."
                />

                <div className="w-full max-w-3xl space-y-6">
                <div className="flex items-start gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground">
                    <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p>
                        Timer updates apply immediately to <strong>newly created</strong> cart holds, claims, and future shelf checks. Existing active student reservations retain their original expiration timestamps.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="cart_soft_hold_minutes"
                                className="flex items-center gap-1.5 text-sm font-semibold"
                            >
                                <Clock className="size-4 text-ocean-teal" />
                                Stage 1: Cart Soft Hold Duration (Minutes)
                            </Label>
                            <Input
                                id="cart_soft_hold_minutes"
                                type="number"
                                min={5}
                                max={120}
                                value={data.cart_soft_hold_minutes}
                                onChange={(e) =>
                                    setData(
                                        'cart_soft_hold_minutes',
                                        parseInt(e.target.value, 10) || 0,
                                    )
                                }
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Rolling timer (5–120 min, default 15) that protects items in a student&apos;s cart while they remain active in the app.
                            </p>
                            <InputError message={errors.cart_soft_hold_minutes} />
                        </div>

                        <div className="space-y-2 border-t border-border pt-5">
                            <Label
                                htmlFor="order_hard_hold_hours"
                                className="flex items-center gap-1.5 text-sm font-semibold"
                            >
                                <Clock className="size-4 text-golden-sand" />
                                Stage 2: Order Claim Hard Hold Duration (Hours)
                            </Label>
                            <Input
                                id="order_hard_hold_hours"
                                type="number"
                                min={1}
                                max={168}
                                value={data.order_hard_hold_hours}
                                onChange={(e) =>
                                    setData(
                                        'order_hard_hold_hours',
                                        parseInt(e.target.value, 10) || 0,
                                    )
                                }
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Fixed countdown (1–168 hours, default 24) given to a buyer to visit the Campus Hub with their Claim QR and cash after pressing &ldquo;Buy&rdquo;.
                            </p>
                            <InputError message={errors.order_hard_hold_hours} />
                        </div>

                        <div className="space-y-2 border-t border-border pt-5">
                            <Label
                                htmlFor="item_shelf_expiry_days"
                                className="flex items-center gap-1.5 text-sm font-semibold"
                            >
                                <Clock className="size-4 text-rose-500" />
                                Hub Shelf Expiration Period (Days)
                            </Label>
                            <Input
                                id="item_shelf_expiry_days"
                                type="number"
                                min={7}
                                max={365}
                                value={data.item_shelf_expiry_days}
                                onChange={(e) =>
                                    setData(
                                        'item_shelf_expiry_days',
                                        parseInt(e.target.value, 10) || 0,
                                    )
                                }
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Number of days (7–365 days, default 30) an unsold item sits on the Hub shelf before being marked expired and notifying the seller for retrieval.
                            </p>
                            <InputError message={errors.item_shelf_expiry_days} />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="gap-2 min-w-36">
                            <Save className="size-4" />
                            {processing ? 'Saving Timers...' : 'Save Configuration'}
                        </Button>
                    </div>
                </form>
                </div>
            </PageContainer>
        </>
    );
}

Settings.layout = {
    breadcrumbs: [
        {
            title: 'System Timers',
            href: admin.settings().url,
        },
    ],
};
