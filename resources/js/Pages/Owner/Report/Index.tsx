import { Head, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, FileText, TrendingDown, TrendingUp, Wallet, Coins } from 'lucide-react';
import { useState } from 'react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import EmptyState from '@/Components/EmptyState';
import KpiCard from '@/Components/dashboard/KpiCard';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { formatRupiah } from '@/lib/formatters';
import { PageProps } from '@/types';

type Mode = 'daily' | 'monthly' | 'custom';

interface Summary {
    omzet: number;
    hpp: number;
    laba_kotor: number;
    pengeluaran: number;
    laba_bersih: number;
    paid_total: number;
    unpaid_total: number;
    pending_amount: number;
}

interface DailyRow {
    date: string;
    label: string;
    omzet: number;
    hpp: number;
    pengeluaran: number;
    laba_bersih: number;
}

interface Report {
    summary: Summary;
    daily: DailyRow[];
    expense_by_category: { category: string; total: number }[];
    top_menus: { menu_name: string; total_qty: number; total_revenue: number }[];
}

interface Filters {
    mode: Mode;
    date: string | null;
    month: string | null;
    start: string | null;
    end: string | null;
}

interface Props extends PageProps {
    report: Report;
    filters: Filters;
    range: { mode: Mode; label: string; start: string; end: string };
}

const todayStr = () => new Date().toISOString().split('T')[0];
const monthStr = () => todayStr().slice(0, 7);

export default function OwnerReportIndex({ report, filters, range }: Props) {
    const [mode, setMode] = useState<Mode>(filters.mode ?? 'daily');
    const [date, setDate] = useState(filters.date ?? todayStr());
    const [month, setMonth] = useState(filters.month ?? monthStr());
    const [start, setStart] = useState(filters.start ?? range.start);
    const [end, setEnd] = useState(filters.end ?? range.end);

    const buildQuery = () => {
        if (mode === 'monthly') return { mode, month };
        if (mode === 'custom') return { mode, start, end };
        return { mode, date };
    };

    const apply = () => {
        router.get(route('owner.reports.index'), buildQuery(), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportUrl = (kind: 'pdf' | 'excel') =>
        route(`owner.reports.export.${kind}` as 'owner.reports.export.pdf', buildQuery());

    const { summary } = report;

    return (
        <OwnerLayout>
            <Head title="Laporan" />

            <div className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Periode: {range.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={exportUrl('pdf')}>
                            <Button variant="outline" className="gap-2">
                                <FileText className="w-4 h-4" /> PDF
                            </Button>
                        </a>
                        <a href={exportUrl('excel')}>
                            <Button variant="outline" className="gap-2">
                                <FileSpreadsheet className="w-4 h-4" /> Excel
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Filter bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="space-y-1.5">
                                <Label>Periode</Label>
                                <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Harian</SelectItem>
                                        <SelectItem value="monthly">Bulanan</SelectItem>
                                        <SelectItem value="custom">Custom Range</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {mode === 'daily' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="date">Tanggal</Label>
                                    <Input id="date" type="date" max={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} />
                                </div>
                            )}

                            {mode === 'monthly' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="month">Bulan</Label>
                                    <Input id="month" type="month" max={monthStr()} value={month} onChange={(e) => setMonth(e.target.value)} />
                                </div>
                            )}

                            {mode === 'custom' && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="start">Dari</Label>
                                        <Input id="start" type="date" max={todayStr()} value={start} onChange={(e) => setStart(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="end">Sampai</Label>
                                        <Input id="end" type="date" max={todayStr()} value={end} onChange={(e) => setEnd(e.target.value)} />
                                    </div>
                                </>
                            )}

                            <Button onClick={apply} className="gap-2">
                                <Download className="w-4 h-4 rotate-90" /> Terapkan
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard title="Omzet" value={summary.omzet} icon={Coins} colorClass="text-emerald-600" bgClass="bg-emerald-100 dark:bg-emerald-950" />
                    <KpiCard title="HPP" value={summary.hpp} icon={TrendingDown} colorClass="text-amber-600" bgClass="bg-amber-100 dark:bg-amber-950" />
                    <KpiCard title="Pengeluaran" value={summary.pengeluaran} icon={Wallet} colorClass="text-rose-600" bgClass="bg-rose-100 dark:bg-rose-950" />
                    <KpiCard title="Laba Bersih" value={summary.laba_bersih} icon={TrendingUp} colorClass="text-orange-600" bgClass="bg-orange-100 dark:bg-orange-950" isNegativeAllowed />
                </div>

                {/* Payment status breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 p-4">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Transaksi Lunas</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupiah(summary.paid_total)}</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 p-4">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Transaksi Belum Bayar</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupiah(summary.unpaid_total)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Pending</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupiah(summary.pending_amount)}</p>
                    </div>
                </div>

                {/* Daily breakdown */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Rincian Harian</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Omzet</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">HPP</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Pengeluaran</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Laba Bersih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {report.daily.length === 0 ? (
                                    <tr><td colSpan={5}><EmptyState title="Tidak ada data" description="Belum ada transaksi atau pengeluaran pada periode ini." /></td></tr>
                                ) : (
                                    report.daily.map((row) => (
                                        <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{row.label}</td>
                                            <td className="px-4 py-2.5 text-right">{formatRupiah(row.omzet)}</td>
                                            <td className="px-4 py-2.5 text-right">{formatRupiah(row.hpp)}</td>
                                            <td className="px-4 py-2.5 text-right">{formatRupiah(row.pengeluaran)}</td>
                                            <td className={`px-4 py-2.5 text-right font-semibold ${row.laba_bersih < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                                                {formatRupiah(row.laba_bersih)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Secondary tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Pengeluaran per Kategori</h2>
                        </div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {report.expense_by_category.length === 0 ? (
                                    <tr><td className="px-4 py-8 text-center text-muted-foreground">Tidak ada pengeluaran.</td></tr>
                                ) : (
                                    report.expense_by_category.map((row) => (
                                        <tr key={row.category}>
                                            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{row.category}</td>
                                            <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatRupiah(row.total)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Menu Terlaris</h2>
                        </div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {report.top_menus.length === 0 ? (
                                    <tr><td className="px-4 py-8 text-center text-muted-foreground">Belum ada penjualan.</td></tr>
                                ) : (
                                    report.top_menus.map((row) => (
                                        <tr key={row.menu_name}>
                                            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{row.menu_name}</td>
                                            <td className="px-4 py-2.5 text-right text-muted-foreground">{row.total_qty}x</td>
                                            <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatRupiah(row.total_revenue)}</td>
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
