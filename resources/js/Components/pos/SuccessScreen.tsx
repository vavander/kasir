import { CheckCircle2, Printer, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/formatters';

interface TransactionResult {
    id: number;
    invoice_number: string;
    payment_method: string;
    total: number;
    cashier_name: string;
    created_at: string;
    items: { menu_name: string; qty: number; selling_price: number; subtotal: number }[];
}

interface SuccessScreenProps {
    transaction: TransactionResult;
    paidAmount: number;
    onNewTransaction: () => void;
}

export default function SuccessScreen({ transaction, paidAmount, onNewTransaction }: SuccessScreenProps) {
    const change = Math.max(0, paidAmount - transaction.total);

    const handlePrint = () => {
        const params = paidAmount > 0 ? `?paid_amount=${paidAmount}` : '';
        window.open(`/transactions/${transaction.id}/receipt${params}`, '_blank');
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-full max-w-sm space-y-6">
                {/* Success icon */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Transaksi Berhasil!
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {transaction.invoice_number}
                        </p>
                    </div>
                </div>

                {/* Receipt summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-3">
                    <div className="space-y-1.5 text-sm">
                        {transaction.items.map((item) => (
                            <div key={item.menu_name} className="flex justify-between">
                                <span className="text-gray-700 dark:text-gray-300">
                                    {item.menu_name} ×{item.qty}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {formatRupiah(item.subtotal)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between font-bold text-base">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-indigo-600 dark:text-indigo-400">
                                {formatRupiah(transaction.total)}
                            </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Metode</span>
                            <span>{transaction.payment_method}</span>
                        </div>
                        {paidAmount > 0 && (
                            <>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Bayar</span>
                                    <span>{formatRupiah(paidAmount)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                                    <span>Kembalian</span>
                                    <span>{formatRupiah(change)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5">
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handlePrint}
                    >
                        <Printer className="w-4 h-4" />
                        Cetak Struk
                    </Button>
                    <Button
                        className="w-full gap-2 h-11"
                        onClick={onNewTransaction}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Transaksi Baru
                    </Button>
                </div>
            </div>
        </div>
    );
}
