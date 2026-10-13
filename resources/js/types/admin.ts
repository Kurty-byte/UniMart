export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    is_suspended: boolean;
    suspended_at: string | null;
    items_count: number;
    reports_count: number;
    created_at: string | null;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: PaginationLink[];
};
