export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    ewallet_provider?: string;
    ewallet_account_name?: string;
    ewallet_account_number?: string;
    ewallet_qr_code?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    roles?: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
