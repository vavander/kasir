import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/formatters';

type PaymentMethod = 'cash' | 'qris' | 'transfer';

interface PendingTransaction {
    id: number;
    invoice_number: string;
    customer_name: string | null;
    total: number;
}

interface Props {
    /** One or more orders being settled with a single payment. */
    transactions: PendingTransaction[];
    /** Single-settle route, used when exactly one order is selected. */
    settleRoute: string;
    /** Bulk-settle route, used when more than one order is selected. */
    bulkSettleRoute: string;
    onClose: () => void;
}

const methods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Tunai' },
    { value: 'qris', label: 'QRIS' },
    { value: 'transfer', label: 'Transfer' },
];

export default function SettlePaymentModal({ transactions, settleRoute, bulkSettleRoute, onClose }: Props) {
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [paidDisplay, setPaidDisplay] = useState('');
    const [processing, setProcessing] = useState(false);

    const isBulk = transactions.length > 1;
    const total = transactions.reduce((s, t) => s + t.total, 0);

    const numericPaid = paidDisplay ? parseInt(paidDisplay.replace(/\D/g, ''), 10) : 0;
    const change = method === 'cash' ? Math.max(0, numericPaid - total) : 0;
    const canSubmit = method !== 'cash' || numericPaid >= total;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!canSubmit || processing) return;

        const paid = method === 'cash' ? numericPaid : total;
        const options = {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onClose(),
        };

        if (isBulk) {
            router.put(
                bulkSettleRoute,
                { transaction_ids: transactions.map((t) => t.id), payment_method: method, paid_amount: paid },
                options,
            );
        } else {
            router.put(settleRoute, { payment_method: method, paid_amount: paid }, options);
        }
    };

    const formatInput = (v: string) => {
        const n = v.replace(/\D/g, '');
        return n ? parseInt(n, 10).toLocaleString('id-ID') : '';
    };

    const subtitle = isBulk
        ? `${transactions.length} pesanan digabung`
        : `${transactions[0].invoice_number} — ${transactions[0].customer_name ?? '-'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!processing ? onClose : undefined} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                <div className="bg-orange-600 px-6 py-4">
                    <h2 className="text-white font-semibold text-lg">Selesaikan Pembayaran</h2>
                    <p className="text-orange-200 text-sm mt-0.5">{subtitle}</p>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5 overflow-y-auto">
                    {/* When bulk, list the orders being combined so the cashier can confirm. */}
                    {isBulk && (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 max-h-40 overflow-y-auto">
                            {transactions.map((t) => (
                                <div key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <span className="text-gray-900 dark:text-white truncate mr-2">{t.customer_name ?? t.invoice_number}</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatRupiah(t.total)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Tagihan</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatRupiah(total)}</span>
                    </div>

                    <div className="space-y-2">
                        <Label>Metode Pembayaran</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {methods.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setMethod(m.value)}
                                    className={cn(
                                        'rounded-xl border-2 p-3 text-sm font-semibold transition-all',
                                        method === m.value ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300' : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
                                    )}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {method === 'cash' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="settle_paid">Nominal Bayar</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                <Input
                                    id="settle_paid"
                                    autoFocus
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={paidDisplay}
                                    onChange={(e) => setPaidDisplay(formatInput(e.target.value))}
                                    className={cn('pl-9 text-lg font-semibold', numericPaid > 0 && numericPaid < total ? 'border-rose-400' : '')}
                                />
                            </div>
                            {numericPaid >= total && (
                                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
                                    <span className="text-sm text-emerald-700 dark:text-emerald-300">Kembalian</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatRupiah(change)}</span>
                                </div>
                            )}
                            {numericPaid > 0 && numericPaid < total && (
                                <p className="text-xs text-rose-500">Kurang {formatRupiah(total - numericPaid)}</p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="flex-1">Batal</Button>
                        <Button type="submit" disabled={!canSubmit || processing} className="flex-1 gap-2">
                            {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                            Selesaikan
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
