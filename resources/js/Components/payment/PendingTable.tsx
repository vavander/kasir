import { router } from '@inertiajs/react';
import { Clock, Search, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import EmptyState from '@/Components/EmptyState';
import SettlePaymentModal from '@/Components/payment/SettlePaymentModal';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/formatters';

interface PendingRow {
    id: number;
    invoice_number: string;
    customer_name: string | null;
    cashier_name: string;
    total: number;
    payment_status: string;
    created_at: string;
}

interface Props {
    pending: { data: PendingRow[]; [key: string]: any };
    filters: { search: string; date?: string };
    indexRoute: string;
    settleRouteName: string;
    showCashier?: boolean;
}

export default function PendingTable({ pending, filters, indexRoute, settleRouteName, showCashier = false }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [date, setDate] = useState(filters.date ?? '');
    const [settling, setSettling] = useState<PendingRow | null>(null);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            router.get(indexRoute, { search, date }, { preserveState: true, replace: true });
        }, 300);
        return () => { if (timeout.current) clearTimeout(timeout.current); };
    }, [search, date]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-sm flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Cari nama pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} className="w-auto" />
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pelanggan</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                {showCashier && <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kasir</th>}
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {pending.data.length === 0 ? (
                                <tr>
                                    <td colSpan={showCashier ? 7 : 6}>
                                        <EmptyState icon={Clock} title="Tidak ada pesanan belum bayar" description="Semua pesanan sudah lunas." />
                                    </td>
                                </tr>
                            ) : (
                                pending.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-white">{t.invoice_number}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.customer_name ?? '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.created_at}</td>
                                        {showCashier && <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{t.cashier_name}</td>}
                                        <td className="px-4 py-3 text-center"><Badge variant="warning">BELUM BAYAR</Badge></td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{formatRupiah(t.total)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Button size="sm" className="gap-1.5" onClick={() => setSettling(t)}>
                                                <Wallet className="w-3.5 h-3.5" /> Lunasi
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {settling && (
                <SettlePaymentModal
                    transaction={settling}
                    settleRoute={route(settleRouteName as any, settling.id)}
                    onClose={() => setSettling(null)}
                />
            )}
        </div>
    );
}
