import { Link, router } from '@inertiajs/react';
import { Eye, Printer, Receipt, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import EmptyState from '@/Components/EmptyState';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/formatters';

interface Transaction {
    id: number;
    invoice_number: string;
    cashier_name?: string;
    payment_method: string;
    total: number;
    created_at: string;
}

interface PaginatedTransactions {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface TransactionTableProps {
    transactions: PaginatedTransactions;
    filters: { search: string };
    showCashier?: boolean;
    indexRoute: string;
    showRoute: string;
    showReceiptButton?: boolean;
}

const paymentBadge: Record<string, 'success' | 'default' | 'secondary'> = {
    Tunai: 'success',
    QRIS: 'default',
    'Transfer Bank': 'secondary',
};

export default function TransactionTable({
    transactions,
    filters,
    showCashier = false,
    indexRoute,
    showRoute,
    showReceiptButton = false,
}: TransactionTableProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            router.get(indexRoute, { search }, { preserveState: true, replace: true });
        }, 300);
        return () => { if (timeout.current) clearTimeout(timeout.current); };
    }, [search]);

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Cari nomor invoice..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                            {showCashier && (
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kasir</th>
                            )}
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Pembayaran</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground w-24">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.data.length === 0 ? (
                            <tr>
                                <td colSpan={showCashier ? 6 : 5}>
                                    <EmptyState
                                        icon={Receipt}
                                        title={search ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
                                        description={search
                                            ? `Tidak ada transaksi dengan invoice "${search}".`
                                            : 'Transaksi yang tercatat akan muncul di sini.'}
                                    />
                                </td>
                            </tr>
                        ) : (
                            transactions.data.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-white">
                                        {t.invoice_number}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {t.created_at}
                                    </td>
                                    {showCashier && (
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {t.cashier_name ?? '-'}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={paymentBadge[t.payment_method] ?? 'secondary'}>
                                            {t.payment_method}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                                        {formatRupiah(t.total)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <Link href={route(showRoute, t.id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                            {showReceiptButton && (
                                                <a
                                                    href={route('transactions.receipt', t.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {transactions.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>
                        Menampilkan {(transactions.current_page - 1) * transactions.per_page + 1}–
                        {Math.min(transactions.current_page * transactions.per_page, transactions.total)} dari {transactions.total}
                    </p>
                    <div className="flex gap-1">
                        {transactions.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={[
                                    'px-3 py-1 rounded-md text-xs transition-colors',
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed',
                                ].join(' ')}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
