import { AlertTriangle, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export default function ErrorState({ icon: Icon = AlertTriangle, title, description, action, className }: ErrorStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center text-center px-6 py-14', className)}>
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-rose-500 dark:text-rose-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
