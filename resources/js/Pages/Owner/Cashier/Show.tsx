import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Coins, Receipt, TrendingUp, UserRound } from 'lucide-react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import ResetPasswordDialog from '@/Components/cashier/ResetPasswordDialog';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { formatRupiah } from '@/lib/formatters';
import { PageProps } from '@/types';

interface Props extends PageProps {
    cashier: {
        id: number;
        name: string;
        email: string;
        avatar_url: string | null;
        status: 'active' | 'inactive';
        created_at: string;
    };
    stats: {
        transactions_count: number;
        total_sales: number;
        today_transactions: number;
        today_sales: number;
    };
}

export default function CashierShow({ cashier, stats }: Props) {
    const cards = [
        { label: 'Total Transaksi', value: String(stats.transactions_count), icon: Receipt },
        { label: 'Total Penjualan', value: formatRupiah(stats.total_sales), icon: Coins },
        { label: 'Transaksi Hari Ini', value: String(stats.today_transactions), icon: TrendingUp },
        { label: 'Penjualan Hari Ini', value: formatRupiah(stats.today_sales), icon: Coins },
    ];

    return (
        <OwnerLayout>
            <Head title={`Kasir — ${cashier.name}`} />
            <div className="p-6 space-y-6 max-w-4xl">
                <div className="flex items-center gap-3">
                    <Link href={route('owner.cashiers.index')} className="text-muted-foreground hover:text-gray-900 dark:hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Kasir</h1>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex items-center gap-4 flex-wrap">
                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden shrink-0">
                        {cashier.avatar_url ? (
                            <img src={cashier.avatar_url} alt={cashier.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserRound className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{cashier.name}</h2>
                            <Badge variant={cashier.status === 'active' ? 'default' : 'secondary'}>
                                {cashier.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{cashier.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Bergabung {cashier.created_at}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('owner.cashiers.edit', cashier.id)}>
                            <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <ResetPasswordDialog cashierId={cashier.id} cashierName={cashier.name} />
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((c) => {
                        const Icon = c.icon;
                        return (
                            <Card key={c.label}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
                                        <Icon className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-2 truncate">{c.value}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </OwnerLayout>
    );
}
