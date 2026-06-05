import { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: number;
    title?: string;
    description: string;
    variant: ToastVariant;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
let counter = 0;

function emit() {
    listeners.forEach((l) => l(toasts));
}

export function dismissToast(id: number) {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
}

export function toast(description: string, variant: ToastVariant = 'info', title?: string) {
    const id = ++counter;
    toasts = [...toasts, { id, description, variant, title }];
    emit();
    setTimeout(() => dismissToast(id), 4000);
    return id;
}

export const toastSuccess = (msg: string, title?: string) => toast(msg, 'success', title);
export const toastError = (msg: string, title?: string) => toast(msg, 'error', title);
export const toastWarning = (msg: string, title?: string) => toast(msg, 'warning', title);

export function useToasts(): ToastItem[] {
    const [state, setState] = useState<ToastItem[]>(toasts);

    useEffect(() => {
        listeners.add(setState);
        setState(toasts);
        return () => {
            listeners.delete(setState);
        };
    }, []);

    return state;
}
