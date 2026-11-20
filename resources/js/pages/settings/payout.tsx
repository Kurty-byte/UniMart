import { Head, router, useForm } from '@inertiajs/react';
import { QrCode, ShieldCheck, Trash2, Upload, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { destroy, edit, update } from '@/routes/payout';

type PayoutSettingsProps = {
    ewalletQrUrl?: string | null;
    hasEwalletQr: boolean;
    ewalletProvider?: string | null;
    ewalletAccountName?: string | null;
    ewalletAccountNumber?: string | null;
};

export default function PayoutSettings({
    ewalletQrUrl,
    hasEwalletQr,
    ewalletProvider,
    ewalletAccountName,
    ewalletAccountNumber,
}: PayoutSettingsProps) {
    const qrInputRef = useRef<HTMLInputElement>(null);
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [removingQr, setRemovingQr] = useState(false);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        ewallet_provider: string;
        ewallet_account_name: string;
        ewallet_account_number: string;
        ewallet_qr: File | null;
    }>({
        _method: 'put',
        ewallet_provider: ewalletProvider ?? '',
        ewallet_account_name: ewalletAccountName ?? '',
        ewallet_account_number: ewalletAccountNumber ?? '',
        ewallet_qr: null,
    });

    useEffect(() => {
        return () => {
            if (qrPreview) {
                URL.revokeObjectURL(qrPreview);
            }
        };
    }, [qrPreview]);

    const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        if (qrPreview) {
            URL.revokeObjectURL(qrPreview);
        }
        setQrPreview(URL.createObjectURL(file));
        setData('ewallet_qr', file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setQrPreview(null);
                setData('ewallet_qr', null);
                if (qrInputRef.current) {
                    qrInputRef.current.value = '';
                }
                toast.success('Payout details saved successfully.');
            },
            onError: () => {
                toast.error('Please review your payout details.');
            },
        });
    };

    const handleDeleteQr = () => {
        setRemovingQr(true);
        router.delete(destroy().url, {
            preserveScroll: true,
            onSuccess: () => {
                if (qrPreview) {
                    URL.revokeObjectURL(qrPreview);
                    setQrPreview(null);
                }
                setData('ewallet_qr', null);
                toast.success('E-wallet QR code removed.');
            },
            onFinish: () => setRemovingQr(false),
        });
    };

    const currentQrSrc = qrPreview || ewalletQrUrl || undefined;

    return (
        <>
            <Head title="Payout settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Payout & E-Wallet Settings"
                    description="Save your e-wallet QR code once so Campus Hub staff can disburse your earnings digitally whenever your items sell."
                />

                <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    <p>
                        Your QR code is stored privately and only visible to authorized Hub Staff during payout disbursement. If Hub Staff lacks digital balance, you will be notified to collect physical cash at the desk.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-4 text-ocean-teal dark:text-seafoam-aqua" />
                            <h3 className="text-sm font-semibold text-foreground">
                                Account Details
                            </h3>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="payout_provider">E-Wallet Provider</Label>
                                <NativeSelect
                                    id="payout_provider"
                                    value={data.ewallet_provider}
                                    onChange={(e) => setData('ewallet_provider', e.target.value)}
                                >
                                    <option value="">Select a provider</option>
                                    <option value="gcash">GCash</option>
                                    <option value="maya">Maya</option>
                                    <option value="grabpay">GrabPay</option>
                                    <option value="shopeepay">ShopeePay</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="other">Other</option>
                                </NativeSelect>
                                <InputError message={errors.ewallet_provider} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payout_account_name">Account Name</Label>
                                <Input
                                    id="payout_account_name"
                                    value={data.ewallet_account_name}
                                    onChange={(e) => setData('ewallet_account_name', e.target.value)}
                                    placeholder="e.g. Maria Santos"
                                />
                                <InputError message={errors.ewallet_account_name} />
                            </div>

                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="payout_account_number">Account Number / Mobile</Label>
                                <Input
                                    id="payout_account_number"
                                    value={data.ewallet_account_number}
                                    onChange={(e) => setData('ewallet_account_number', e.target.value)}
                                    placeholder="e.g. 09171234567"
                                />
                                <InputError message={errors.ewallet_account_number} />
                            </div>
                        </div>

                        <div className="border-t border-border pt-4 space-y-3">
                            <Label className="text-sm font-medium">Static Receive QR Code</Label>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="size-36 shrink-0 rounded-xl border bg-white p-2 flex items-center justify-center overflow-hidden">
                                    {currentQrSrc ? (
                                        <img
                                            src={currentQrSrc}
                                            alt="E-wallet QR code"
                                            className="size-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-2">
                                            <QrCode className="size-8 mb-1.5 opacity-40" />
                                            <span className="text-[11px]">No QR uploaded</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Upload your personal static receive QR code (PNG, JPG, or WebP up to 4MB). Avoid QR codes with a pre-filled fixed amount.
                                    </p>

                                    <input
                                        ref={qrInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={handleQrChange}
                                    />

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => qrInputRef.current?.click()}
                                            className="gap-1.5"
                                        >
                                            <Upload className="size-4" />
                                            <span>{hasEwalletQr || qrPreview ? 'Replace QR' : 'Upload QR'}</span>
                                        </Button>

                                        {hasEwalletQr && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={removingQr}
                                                onClick={handleDeleteQr}
                                                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="size-3.5" />
                                                <span>{removingQr ? 'Removing...' : 'Remove QR'}</span>
                                            </Button>
                                        )}
                                    </div>

                                    <InputError message={errors.ewallet_qr} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing} className="min-w-32">
                            {processing ? 'Saving...' : 'Save Payout Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PayoutSettings.layout = {
    breadcrumbs: [
        {
            title: 'Payout settings',
            href: edit(),
        },
    ],
};
