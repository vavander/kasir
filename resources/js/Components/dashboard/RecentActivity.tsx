import { CreditCard, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/formatters';

interface RecentTransaction {
    id: number;
    invoice_number: string;
    cashier_name: string;
    payment_method: string;
    total: number;
    created_at: string;
}

interface RecentExpense {
    id: number;
    category: string;
    amount: number;
    description?: string;
    created_by: string;
    expense_date: string;
}

interface RecentActivityProps {
    transactions: RecentTransaction[];
    expenses: RecentExpense[];
}

const paymentBadgeVariant: Record<string, 'default' | 'secondary' | 'success'> = {
    Tunai: 'success',
    QRIS: 'default',
    'Transfer Bank': 'secondary',
};

export default function RecentActivity({ transactions, expenses }: RecentActivityProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Transactions */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-orange-500" />
                        Transaksi Terbaru
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {transactions.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                            Belum ada transaksi hari ini
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {transactions.map((t) => (
                                <div key={t.id} className="px-6 py-3 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {t.invoice_number}
                                            </p>
                                            <Badge
                                                variant={paymentBadgeVariant[t.payment_method] ?? 'secondary'}
                                                className="text-xs shrink-0"
                                            >
                                                {t.payment_method}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {t.cashier_name} · {t.created_at}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                                        {formatRupiah(t.total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-amber-500" />
                        Pengeluaran Terbaru
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {expenses.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                            Belum ada pengeluaran tercatat
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {expenses.map((e) => (
                                <div key={e.id} className="px-6 py-3 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {e.category}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {e.created_by} · {e.expense_date}
                                            {e.description ? ` · ${e.description}` : ''}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                                        -{formatRupiah(e.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
