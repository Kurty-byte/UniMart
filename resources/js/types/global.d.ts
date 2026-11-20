import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            listingCategories?: {
                id: number;
                name: string;
                children?: { id: number; name: string }[];
            }[];
            listingConditions?: {
                value: string;
                label: string;
            }[];
            unreadNotificationsCount?: number;
            unreadMessagesCount?: number;
            [key: string]: unknown;
        };
    }
}
