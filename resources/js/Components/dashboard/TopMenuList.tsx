import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatRupiah } from '@/lib/formatters';

interface TopMenu {
    menu_name: string;
    total_qty: number;
    total_revenue: number;
}

interface TopMenuListProps {
    data: TopMenu[];
}

const rankColors = [
    'bg-amber-400 text-white',
    'bg-gray-300 text-gray-700',
    'bg-amber-600 text-white',
    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
];

export default function TopMenuList({ data }: TopMenuListProps) {
    if (data.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Menu Terlaris
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        Belum ada data transaksi
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Menu Terlaris
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.map((item, index) => (
                        <div key={item.menu_name} className="flex items-center gap-3 px-6 py-3">
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankColors[index] ?? rankColors[4]}`}
                            >
                                {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {item.menu_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {item.total_qty} porsi terjual
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                                {formatRupiah(item.total_revenue)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
