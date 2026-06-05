import { usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { dismissToast, toast, ToastVariant, useToasts } from '@/lib/use-toast';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

const styles: Record<ToastVariant, { wrap: string; icon: typeof Info; iconClass: string }> = {
    success: { wrap: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950', icon: CheckCircle2, iconClass: 'text-emerald-600 dark:text-emerald-400' },
    error: { wrap: 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950', icon: XCircle, iconClass: 'text-rose-600 dark:text-rose-400' },
    warning: { wrap: 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950', icon: AlertTriangle, iconClass: 'text-amber-600 dark:text-amber-400' },
    info: { wrap: 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900', icon: Info, iconClass: 'text-indigo-600 dark:text-indigo-400' },
};

export default function Toaster() {
    const toasts = useToasts();
    const { flash } = usePage<PageProps>().props;
    const lastFlash = useRef<string>('');

    // Bridge Inertia flash messages into toasts.
    useEffect(() => {
        const key = `${flash?.success ?? ''}|${flash?.error ?? ''}`;
        if (key === lastFlash.current) return;
        lastFlash.current = key;
        if (flash?.success) toast(flash.success, 'success');
        if (flash?.error) toast(flash.error, 'error');
    }, [flash?.success, flash?.error]);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
            {toasts.map((t) => {
                const s = styles[t.variant];
                const Icon = s.icon;
                return (
                    <div
                        key={t.id}
                        role="status"
                        className={cn(
                            'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
                            'animate-in slide-in-from-top-2 fade-in duration-200',
                            s.wrap,
                        )}
                    >
                        <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', s.iconClass)} />
                        <div className="flex-1 min-w-0">
                            {t.title && <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.title}</p>}
                            <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{t.description}</p>
                        </div>
                        <button
                            onClick={() => dismissToast(t.id)}
                            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            aria-label="Tutup"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
