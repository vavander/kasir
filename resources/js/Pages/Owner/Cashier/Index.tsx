import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Eye, Plus, Power, Search, UserRound, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import EmptyState from '@/Components/EmptyState';
import ResetPasswordDialog from '@/Components/cashier/ResetPasswordDialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/formatters';
import { PageProps } from '@/types';

interface CashierRow {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    status: 'active' | 'inactive';
    transactions_count: number;
    transactions_sum_total: number;
    created_at: string;
}

interface Props extends PageProps {
    cashiers: { data: CashierRow[]; [key: string]: any };
    filters: { search: string };
}

export default function CashierIndex({ cashiers, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            router.get(route('owner.cashiers.index'), { search }, { preserveState: true, replace: true });
        }, 300);
        return () => { if (timeout.current) clearTimeout(timeout.current); };
    }, [search]);

    return (
        <OwnerLayout>
            <Head title="Kasir" />

            <div className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kasir</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Kelola akun kasir restoran Anda</p>
                    </div>
                    <Link href={route('owner.cashiers.create')}>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> Tambah Kasir</Button>
                    </Link>
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kasir</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Transaksi</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total Penjualan</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Dibuat</th>
                                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {cashiers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <EmptyState
                                                icon={Users}
                                                title="Belum ada kasir"
                                                description="Tambahkan kasir pertama untuk mulai mengelola transaksi."
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    cashiers.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center overflow-hidden shrink-0">
                                                        {c.avatar_url ? (
                                                            <img src={c.avatar_url} alt={c.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserRound className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                                                    {c.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{c.transactions_count}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatRupiah(c.transactions_sum_total)}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">{c.created_at}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                    <Link href={route('owner.cashiers.show', c.id)}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Detail"><Eye className="w-3.5 h-3.5" /></Button>
                                                    </Link>
                                                    <Link href={route('owner.cashiers.edit', c.id)}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit"><Edit2 className="w-3.5 h-3.5" /></Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 ${c.status === 'active' ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-600 hover:text-emerald-700'}`}
                                                        title={c.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                                        onClick={() => router.patch(route('owner.cashiers.toggle-status', c.id), {}, { preserveScroll: true })}
                                                    >
                                                        <Power className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <ResetPasswordDialog cashierId={c.id} cashierName={c.name} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}
