export type UserRole = 'owner' | 'cashier';
export type UserStatus = 'active' | 'inactive';
export type PaymentMethod = 'cash' | 'qris' | 'transfer';
export type ExpenseCategory = 'Bahan Baku' | 'Gas' | 'Listrik' | 'Transport' | 'Lainnya';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    avatar_url?: string | null;
    email_verified_at?: string;
    role: UserRole;
    status: UserStatus;
    last_login_at?: string;
}

export interface Setting {
    id: number;
    store_name: string;
    logo?: string;
    logo_url?: string;
    address?: string;
    phone?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    setting?: Setting;
    flash?: {
        success?: string;
        error?: string;
    };
};
