import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/formatters';
import type { CartItem } from './CartPanel';

type PaymentMethod = 'cash' | 'qris' | 'transfer';

interface CheckoutModalProps {
    items: CartItem[];
    total: number;
    onConfirm: (paymentMethod: PaymentMethod, paidAmount: number) => void;
    onCancel: () => void;
    processing: boolean;
}

const paymentMethods: { value: PaymentMethod; label: string; desc: string }[] = [
    { value: 'cash', label: 'Tunai', desc: 'Bayar dengan uang tunai' },
    { value: 'qris', label: 'QRIS', desc: 'Scan QR Code' },
    { value: 'transfer', label: 'Transfer', desc: 'Transfer Bank / E-wallet' },
];

export default function CheckoutModal({
    items,
    total,
    onConfirm,
    onCancel,
    processing,
}: CheckoutModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [paidAmount, setPaidAmount] = useState('');

    const numericPaid = paidAmount ? parseInt(paidAmount.replace(/\D/g, ''), 10) : 0;
    const change = paymentMethod === 'cash' ? Math.max(0, numericPaid - total) : 0;
    const canSubmit = paymentMethod !== 'cash' || numericPaid >= total;

    useEffect(() => {
        if (paymentMethod !== 'cash') setPaidAmount('');
    }, [paymentMethod]);

    const handleSubmit = () => {
        const paid = paymentMethod === 'cash' ? numericPaid : total;
        onConfirm(paymentMethod, paid);
    };

    const formatInput = (value: string) => {
        const numeric = value.replace(/\D/g, '');
        return numeric ? parseInt(numeric, 10).toLocaleString('id-ID') : '';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!processing ? onCancel : undefined} />

            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 px-6 py-4">
                    <h2 className="text-white font-semibold text-lg">Konfirmasi Pembayaran</h2>
                    <p className="text-indigo-200 text-sm mt-0.5">
                        {items.reduce((s, i) => s + i.qty, 0)} item
                    </p>
                </div>

                <div className="p-6 space-y-5">
                    {/* Total */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatRupiah(total)}
                        </span>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label>Metode Pembayaran</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentMethods.map((pm) => (
                                <button
                                    key={pm.value}
                                    onClick={() => setPaymentMethod(pm.value)}
                                    className={cn(
                                        'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all text-center',
                                        paymentMethod === pm.value
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                                    )}
                                >
                                    <span className={cn(
                                        'text-sm font-semibold',
                                        paymentMethod === pm.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white',
                                    )}>
                                        {pm.label}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground leading-tight">
                                        {pm.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cash: Nominal bayar */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="paid">Nominal Bayar</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                <Input
                                    id="paid"
                                    autoFocus
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(formatInput(e.target.value))}
                                    className={cn(
                                        'pl-9 text-lg font-semibold',
                                        numericPaid > 0 && numericPaid < total ? 'border-rose-400' : '',
                                    )}
                                />
                            </div>
                            {/* Quick amount buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {[total, Math.ceil(total / 5000) * 5000, Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000]
                                    .filter((v, i, arr) => arr.indexOf(v) === i && v >= total)
                                    .slice(0, 4)
                                    .map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setPaidAmount(amount.toLocaleString('id-ID'))}
                                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-gray-700 dark:text-gray-300 transition-colors"
                                        >
                                            {formatRupiah(amount)}
                                        </button>
                                    ))}
                            </div>

                            {/* Kembalian */}
                            {numericPaid >= total && (
                                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
                                    <span className="text-sm text-emerald-700 dark:text-emerald-300">Kembalian</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                        {formatRupiah(change)}
                                    </span>
                                </div>
                            )}
                            {numericPaid > 0 && numericPaid < total && (
                                <p className="text-xs text-rose-500">
                                    Kurang {formatRupiah(total - numericPaid)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <Button variant="outline" onClick={onCancel} disabled={processing} className="flex-1">
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || processing}
                            className="flex-1 gap-2"
                        >
                            {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                            Proses
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
