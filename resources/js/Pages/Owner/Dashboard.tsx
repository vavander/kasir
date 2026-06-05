import { Head } from '@inertiajs/react';
import { BarChart3, Clock, HandCoins, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import OwnerLayout from '@/Layouts/OwnerLayout';
import KpiCard from '@/Components/dashboard/KpiCard';
import SalesChart from '@/Components/dashboard/SalesChart';
import ExpenseChart from '@/Components/dashboard/ExpenseChart';
import TopMenuList from '@/Components/dashboard/TopMenuList';
import RecentActivity from '@/Components/dashboard/RecentActivity';
import { formatRupiah } from '@/lib/formatters';

interface Summary {
    omzet: number;
    hpp: number;
    pengeluaran: number;
    laba_bersih: number;
}

interface ChartData {
    date: string;
    total: number;
}

interface TopMenu {
    menu_name: string;
    total_qty: number;
    total_revenue: number;
}

interface RecentTransaction {
    id: number;
    invoice_number: string;
    cashier_name: string;
    payment_method: string;
    total: number;
    created_at: string;
}

interface RecentExpense {
    id: number;
    category: string;
    amount: number;
    description?: string;
    created_by: string;
    expense_date: string;
}

interface PendingSummary {
    count: number;
    value: number;
}

interface DashboardProps {
    summary: Summary;
    pending: PendingSummary;
    salesChart: ChartData[];
    expenseChart: ChartData[];
    topMenus: TopMenu[];
    recentTransactions: RecentTransaction[];
    recentExpenses: RecentExpense[];
}

const kpiConfig = [
    {
        key: 'omzet' as const,
        title: 'Omzet Hari Ini',
        icon: TrendingUp,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
        bgClass: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
        key: 'hpp' as const,
        title: 'HPP Hari Ini',
        icon: Wallet,
        colorClass: 'text-amber-600 dark:text-amber-400',
        bgClass: 'bg-amber-50 dark:bg-amber-950',
    },
    {
        key: 'pengeluaran' as const,
        title: 'Pengeluaran Hari Ini',
        icon: Receipt,
        colorClass: 'text-rose-600 dark:text-rose-400',
        bgClass: 'bg-rose-50 dark:bg-rose-950',
    },
    {
        key: 'laba_bersih' as const,
        title: 'Laba Bersih Hari Ini',
        icon: BarChart3,
        colorClass: 'text-indigo-600 dark:text-indigo-400',
        bgClass: 'bg-indigo-50 dark:bg-indigo-950',
        isNegativeAllowed: true,
    },
];

export default function Dashboard({
    summary,
    pending,
    salesChart,
    expenseChart,
    topMenus,
    recentTransactions,
    recentExpenses,
}: DashboardProps) {
    const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

    return (
        <OwnerLayout>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5 capitalize">
                            {today}
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {kpiConfig.map((kpi) => (
                        <KpiCard
                            key={kpi.key}
                            title={kpi.title}
                            value={summary[kpi.key]}
                            icon={kpi.icon}
                            colorClass={kpi.colorClass}
                            bgClass={kpi.bgClass}
                            isNegativeAllowed={kpi.isNegativeAllowed}
                        />
                    ))}
                </div>

                {/* Pending orders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Pesanan Belum Bayar</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pending.count}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Nilai Belum Bayar</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate" title={formatRupiah(pending.value)}>{formatRupiah(pending.value)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                            <HandCoins className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SalesChart data={salesChart} />
                    <ExpenseChart data={expenseChart} />
                </div>

                {/* Top Menus + Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1">
                        <TopMenuList data={topMenus} />
                    </div>
                    <div className="lg:col-span-2">
                        <RecentActivity
                            transactions={recentTransactions}
                            expenses={recentExpenses}
                        />
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}
