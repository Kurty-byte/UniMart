import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Camera, Pencil, QrCode, Trash2, Upload, User, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

type ProfileProps = {
    mustVerifyEmail: boolean;
    status?: string;
    ewalletQrUrl?: string | null;
    hasEwalletQr?: boolean;
};

export default function Profile({
    mustVerifyEmail,
    status,
    ewalletQrUrl,
    hasEwalletQr,
}: ProfileProps) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [removeAvatar, setRemoveAvatar] = useState<boolean>(false);
    const [qrPreview, setQrPreview] = useState<string | null>(null);
    const [removeQr, setRemoveQr] = useState<boolean>(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const qrInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
            if (qrPreview) {
                URL.revokeObjectURL(qrPreview);
            }
        };
    }, [avatarPreview, qrPreview]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
            setAvatarPreview(URL.createObjectURL(file));
            setRemoveAvatar(false);
        }
    };

    const handleRemoveAvatar = () => {
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(null);
        }
        setRemoveAvatar(true);
    };

    const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (qrPreview) {
                URL.revokeObjectURL(qrPreview);
            }
            setQrPreview(URL.createObjectURL(file));
            setRemoveQr(false);
        }
    };

    const handleRemoveQr = () => {
        if (qrInputRef.current) {
            qrInputRef.current.value = '';
        }
        if (qrPreview) {
            URL.revokeObjectURL(qrPreview);
            setQrPreview(null);
        }
        setRemoveQr(true);
    };

    const currentAvatarSrc =
        avatarPreview || (!removeAvatar ? (auth.user.avatar ?? undefined) : undefined);
    const hasAvatarActive = Boolean(
        avatarPreview || (!removeAvatar && auth.user.avatar),
    );
    const hasQrActive = Boolean(
        qrPreview || (!removeQr && (hasEwalletQr || ewalletQrUrl)),
    );
    const currentQrSrc =
        qrPreview || (!removeQr && ewalletQrUrl ? ewalletQrUrl : undefined);

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="Profile Settings"
                    description="Update your personal details, profile photo, and payout credentials."
                />

                <Form
                    {...ProfileController.update.form()}
                    encType="multipart/form-data"
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-8"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Section 1: Personal Information & Profile Photo */}
                            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <User className="size-4 text-ocean-teal dark:text-seafoam-aqua" />
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Personal Information
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Update your profile photo, display name, and registered email address.
                                    </p>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-3 py-2 text-center">
                                    <div className="relative">
                                        <Avatar className="size-24 rounded-full border-2 border-border shadow-xs overflow-hidden">
                                            <AvatarImage
                                                src={currentAvatarSrc}
                                                alt={auth.user.name}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="rounded-full text-xl font-semibold bg-slate-marine-100 text-slate-marine-800 dark:bg-deep-indigo-800 dark:text-seafoam-aqua-200">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <button
                                            type="button"
                                            onClick={() => avatarInputRef.current?.click()}
                                            title="Change photo"
                                            aria-label="Change photo"
                                            className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                        >
                                            <Pencil className="size-3.5" />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5 max-w-sm">
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG, or WebP up to 2MB.
                                        </p>

                                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                            <input
                                                type="file"
                                                ref={avatarInputRef}
                                                name="avatar"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                            <input
                                                type="hidden"
                                                name="remove_avatar"
                                                value={removeAvatar ? '1' : '0'}
                                            />

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="gap-1.5"
                                            >
                                                <Camera className="size-4" />
                                                <span>{hasAvatarActive ? 'Change photo' : 'Upload photo'}</span>
                                            </Button>

                                            {hasAvatarActive && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemoveAvatar}
                                                    className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    <span>Remove</span>
                                                </Button>
                                            )}
                                        </div>

                                        <InputError message={errors.avatar} />
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                className="mt-1 block w-full"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className="mt-1 block w-full"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div className="pt-2">
                                            <p className="text-sm text-muted-foreground">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! hover:text-ocean-teal dark:hover:text-seafoam-aqua"
                                                >
                                                    Click here to re-send the verification email.
                                                </Link>
                                            </p>

                                            {status === 'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-seafoam-aqua-600 dark:text-seafoam-aqua-400">
                                                    A new verification link has been sent to your email address.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 3: Payout & E-Wallet Information */}
                            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="size-4 text-ocean-teal dark:text-seafoam-aqua" />
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Payout & E-Wallet Details
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Configure your e-wallet information so staff can disburse earnings to you when items sell.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="ewallet_provider">E-Wallet Provider</Label>
                                        <select
                                            id="ewallet_provider"
                                            name="ewallet_provider"
                                            defaultValue={(auth.user.ewallet_provider as string) ?? ''}
                                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                                        >
                                            <option value="">Select a provider</option>
                                            <option value="gcash">GCash</option>
                                            <option value="maya">Maya</option>
                                            <option value="grabpay">GrabPay</option>
                                            <option value="shopeepay">ShopeePay</option>
                                            <option value="bank">Bank Transfer</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <InputError message={errors.ewallet_provider} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="ewallet_account_name">Account Name</Label>
                                        <Input
                                            id="ewallet_account_name"
                                            name="ewallet_account_name"
                                            className="mt-1 block w-full"
                                            defaultValue={(auth.user.ewallet_account_name as string) ?? ''}
                                            placeholder="e.g. Juan Dela Cruz"
                                        />
                                        <InputError message={errors.ewallet_account_name} />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="ewallet_account_number">Account Number / Mobile</Label>
                                        <Input
                                            id="ewallet_account_number"
                                            name="ewallet_account_number"
                                            className="mt-1 block w-full"
                                            defaultValue={(auth.user.ewallet_account_number as string) ?? ''}
                                            placeholder="e.g. 09171234567"
                                        />
                                        <InputError message={errors.ewallet_account_number} />
                                    </div>
                                </div>

                                {/* E-Wallet QR Code Upload */}
                                <div className="border-t border-border pt-4 space-y-3">
                                    <Label className="text-sm font-medium">E-Wallet QR Code</Label>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="size-32 shrink-0 rounded-lg border bg-muted/20 overflow-hidden flex items-center justify-center p-2 relative">
                                            {currentQrSrc ? (
                                                <img
                                                    src={currentQrSrc}
                                                    alt="E-wallet QR code"
                                                    className="size-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-2">
                                                    <QrCode className="size-8 mb-1.5 opacity-50" />
                                                    <span className="text-xs">No QR code</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Upload your personal static receive QR code (PNG, JPG, or WebP up to 4MB). Make sure it does not have an expired amount or transaction hold.
                                            </p>

                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <input
                                                    type="file"
                                                    ref={qrInputRef}
                                                    name="ewallet_qr"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    className="hidden"
                                                    onChange={handleQrChange}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="remove_ewallet_qr"
                                                    value={removeQr ? '1' : '0'}
                                                />

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => qrInputRef.current?.click()}
                                                    className="gap-1.5"
                                                >
                                                    <Upload className="size-4" />
                                                    <span>{hasQrActive ? 'Replace QR code' : 'Upload QR code'}</span>
                                                </Button>

                                                {hasQrActive && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleRemoveQr}
                                                        className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                        <span>Remove QR</span>
                                                    </Button>
                                                )}
                                            </div>

                                            <InputError message={errors.ewallet_qr} />
                                            <InputError message={errors.qr_payload} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Submission */}
                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="min-w-28"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
