import { Link, router } from '@inertiajs/react';
import { ChevronLeft, Printer } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import ReceiptModal from '@/Components/ReceiptModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { formatRupiah } from '@/lib/formatters';

interface TransactionItem {
    menu_name: string;
    qty: number;
    selling_price: number;
    hpp?: number;
    subtotal: number;
}

interface TransactionDetailProps {
    transaction: {
        id: number;
        invoice_number: string;
        cashier_name: string;
        payment_method: string;
        subtotal: number;
        total: number;
        created_at: string;
        items: TransactionItem[];
    };
    backRoute: string;
    showHpp?: boolean;
}

const paymentBadge: Record<string, 'success' | 'default' | 'secondary'> = {
    Tunai: 'success',
    QRIS: 'default',
    'Transfer Bank': 'secondary',
};

export default function TransactionDetail({ transaction, backRoute, showHpp = false }: TransactionDetailProps) {
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Back button */}
            <div className="flex items-center gap-3">
                <Link
                    href={route(backRoute)}
                    className="text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                        {transaction.invoice_number}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{transaction.created_at}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => setReceiptUrl(route('transactions.receipt', transaction.id))}>
                    <Printer className="w-4 h-4" />
                    Cetak Struk
                </Button>
            </div>

            {/* Meta info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Informasi Transaksi</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-muted-foreground">Kasir</p>
                            <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                                {transaction.cashier_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Metode Pembayaran</p>
                            <div className="mt-0.5">
                                <Badge variant={paymentBadge[transaction.payment_method] ?? 'secondary'}>
                                    {transaction.payment_method}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Items */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                        Detail Item ({transaction.items.length} item)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transaction.items.map((item, idx) => (
                            <div key={idx} className="px-6 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {item.menu_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {item.qty} × {formatRupiah(item.selling_price)}
                                            {showHpp && item.hpp !== undefined && (
                                                <span className="ml-2 text-amber-600 dark:text-amber-400">
                                                    (HPP: {formatRupiah(item.hpp)})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                                        {formatRupiah(item.subtotal)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatRupiah(transaction.subtotal)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-orange-600 dark:text-orange-400">
                                {formatRupiah(transaction.total)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ReceiptModal url={receiptUrl} onClose={() => setReceiptUrl(null)} />
        </div>
    );
}
