import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/lib/utils';
import { formatCompact, formatRupiah } from '@/lib/formatters';

interface KpiCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    colorClass: string;
    bgClass: string;
    isNegativeAllowed?: boolean;
}

export default function KpiCard({
    title,
    value,
    icon: Icon,
    colorClass,
    bgClass,
    isNegativeAllowed = false,
}: KpiCardProps) {
    const isNegative = value < 0;

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                            {title}
                        </p>
                        <p
                            className={cn(
                                'text-2xl font-bold mt-2 truncate',
                                isNegativeAllowed && isNegative
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-gray-900 dark:text-white',
                            )}
                            title={formatRupiah(value)}
                        >
                            {formatCompact(value)}
                        </p>
                    </div>
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ml-4', bgClass)}>
                        <Icon className={cn('w-6 h-6', colorClass)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
