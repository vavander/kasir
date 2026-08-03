import { router } from '@inertiajs/react';
import { Clock, Search, Trash2, Wallet, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import EmptyState from '@/Components/EmptyState';
import SettlePaymentModal from '@/Components/payment/SettlePaymentModal';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { cn } from '@/lib/utils';
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
    bulkSettleRouteName?: string;
    showCashier?: boolean;
    canDelete?: boolean;
    deleteRouteName?: string;
}

export default function PendingTable({ pending, filters, indexRoute, settleRouteName, bulkSettleRouteName, showCashier = false, canDelete = false, deleteRouteName }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [date, setDate] = useState(filters.date ?? '');
    // Orders being settled (one row, or several combined into a single payment).
    const [settling, setSettling] = useState<PendingRow[] | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bulkEnabled = !!bulkSettleRouteName;

    useEffect(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            router.get(indexRoute, { search, date }, { preserveState: true, replace: true });
        }, 300);
        return () => { if (timeout.current) clearTimeout(timeout.current); };
    }, [search, date]);

    // Drop selected ids that are no longer in the list (e.g. after settling/filtering).
    const idsKey = pending.data.map((t) => t.id).join(',');
    useEffect(() => {
        setSelected((prev) => prev.filter((id) => pending.data.some((t) => t.id === id)));
    }, [idsKey]);

    const toggleOne = (id: number) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const allSelected = pending.data.length > 0 && pending.data.every((t) => selected.includes(t.id));
    const toggleAll = () => {
        setSelected(allSelected ? [] : pending.data.map((t) => t.id));
    };

    const selectedRows = useMemo(
        () => pending.data.filter((t) => selected.includes(t.id)),
        [pending.data, selected],
    );
    const selectedTotal = selectedRows.reduce((s, t) => s + t.total, 0);

    const colSpan = 1 + (showCashier ? 6 : 5) + (bulkEnabled ? 1 : 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-sm flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Cari nama pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} className="w-auto" />
            </div>

            {/* Selection action bar — settle several orders in one payment. */}
            {bulkEnabled && selectedRows.length > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSelected([])}
                            className="text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                            title="Batalkan pilihan"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900 dark:text-white">{selectedRows.length} pesanan dipilih</span>
                            <span className="text-muted-foreground"> · Total </span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">{formatRupiah(selectedTotal)}</span>
                        </div>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={() => setSettling(selectedRows)}>
                        <Wallet className="w-3.5 h-3.5" /> Lunasi Terpilih
                    </Button>
                </div>
            )}

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                {bulkEnabled && (
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            aria-label="Pilih semua"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            disabled={pending.data.length === 0}
                                            className="w-4 h-4 accent-orange-600 cursor-pointer align-middle"
                                        />
                                    </th>
                                )}
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pelanggan</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                {showCashier && <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kasir</th>}
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-44">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {pending.data.length === 0 ? (
                                <tr>
                                    <td colSpan={colSpan}>
                                        <EmptyState icon={Clock} title="Tidak ada pesanan belum bayar" description="Semua pesanan sudah lunas." />
                                    </td>
                                </tr>
                            ) : (
                                pending.data.map((t) => {
                                    const isSelected = selected.includes(t.id);
                                    return (
                                        <tr
                                            key={t.id}
                                            className={cn(
                                                'transition-colors',
                                                isSelected ? 'bg-orange-50/70 dark:bg-orange-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30',
                                            )}
                                        >
                                            {bulkEnabled && (
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Pilih ${t.customer_name ?? t.invoice_number}`}
                                                        checked={isSelected}
                                                        onChange={() => toggleOne(t.id)}
                                                        className="w-4 h-4 accent-orange-600 cursor-pointer align-middle"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-white">{t.invoice_number}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.customer_name ?? '-'}</td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.created_at}</td>
                                            {showCashier && <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{t.cashier_name}</td>}
                                            <td className="px-4 py-3 text-center"><Badge variant="warning">BELUM BAYAR</Badge></td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{formatRupiah(t.total)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Button size="sm" className="gap-1.5" onClick={() => setSettling([t])}>
                                                        <Wallet className="w-3.5 h-3.5" /> Lunasi
                                                    </Button>
                                                    {canDelete && deleteRouteName && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950" title="Hapus pesanan">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Hapus pesanan belum bayar?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Pesanan {t.invoice_number} ({t.customer_name ?? '-'}) sebesar {formatRupiah(t.total)} akan dihapus permanen. Tindakan ini hanya untuk pesanan yang belum lunas.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-rose-600 hover:bg-rose-700"
                                                                        onClick={() => router.delete(route(deleteRouteName as any, t.id), { preserveScroll: true })}
                                                                    >
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {settling && settling.length > 0 && (
                <SettlePaymentModal
                    transactions={settling}
                    settleRoute={route(settleRouteName as any, settling[0].id)}
                    bulkSettleRoute={bulkSettleRouteName ? route(bulkSettleRouteName as any) : ''}
                    onClose={() => setSettling(null)}
                />
            )}
        </div>
    );
}
