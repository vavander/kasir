import { Head, Link, usePage } from '@inertiajs/react';
import { ClipboardList, Coins, Plus, Receipt, ShoppingCart, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import CashierLayout from '@/Layouts/CashierLayout';
import EmptyState from '@/Components/EmptyState';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatRupiah } from '@/lib/formatters';
import { PageProps } from '@/types';

interface RecentTransaction {
    id: number;
    invoice_number: string;
    payment_method: string;
    total: number;
    created_at: string;
}

interface Props extends PageProps {
    summary: {
        transactions_today: number;
        revenue_today: number;
        expenses_today: number;
    };
    recentTransactions: RecentTransaction[];
}

export default function CashierDashboard({ summary, recentTransactions }: Props) {
    const { auth } = usePage<PageProps>().props;
    const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

    const cards = [
        { label: 'Transaksi Hari Ini', value: String(summary.transactions_today), icon: Receipt, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
        { label: 'Pendapatan Hari Ini', value: formatRupiah(summary.revenue_today), icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
        { label: 'Pengeluaran Hari Ini', value: formatRupiah(summary.expenses_today), icon: Wallet, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950' },
    ];

    const quickActions = [
        { label: 'Transaksi Baru', href: route('cashier.pos'), icon: ShoppingCart },
        { label: 'Input Pengeluaran', href: route('cashier.expenses.index'), icon: Plus },
        { label: 'Riwayat Transaksi', href: route('cashier.transactions.index'), icon: ClipboardList },
    ];

    return (
        <CashierLayout>
            <Head title="Beranda" />

            <div className="p-6 space-y-6">
                {/* Hero banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-600 px-6 py-7 text-white">
                    <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-16 right-24 w-40 h-40 bg-white/5 rounded-full" />
                    <div className="relative">
                        <p className="text-sm text-white/80 capitalize">{today}</p>
                        <h1 className="text-2xl sm:text-3xl font-bold mt-1">Halo, {auth.user.name} 👋</h1>
                        <p className="text-white/90 mt-1 text-sm">Siap melayani pelanggan hari ini?</p>
                        <Link href={route('cashier.pos')} className="inline-flex items-center gap-2 mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors">
                            <ShoppingCart className="w-4 h-4" /> Mulai Transaksi
                        </Link>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {cards.map((c) => {
                        const Icon = c.icon;
                        return (
                            <Card key={c.label}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{c.label}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 truncate">{c.value}</p>
                                        </div>
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-3 ${c.bg}`}>
                                            <Icon className={`w-5 h-5 ${c.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {quickActions.map((a) => {
                        const Icon = a.icon;
                        return (
                            <Link
                                key={a.label}
                                href={a.href}
                                className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3.5 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-sm transition-all"
                            >
                                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{a.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Recent transactions */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Transaksi Terbaru</h2>
                        <Link href={route('cashier.transactions.index')} className="text-xs text-orange-600 dark:text-orange-400 hover:underline">
                            Lihat semua
                        </Link>
                    </div>
                    {recentTransactions.length === 0 ? (
                        <EmptyState icon={Receipt} title="Belum ada transaksi" description="Transaksi Anda hari ini akan muncul di sini." />
                    ) : (
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {recentTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 dark:text-white">{t.invoice_number}</p>
                                            <p className="text-xs text-muted-foreground">{t.created_at}</p>
                                        </td>
                                        <td className="px-4 py-3"><Badge variant="secondary">{t.payment_method}</Badge></td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{formatRupiah(t.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </CashierLayout>
    );
}
