import { Head } from '@inertiajs/react';
import { BarChart3, Receipt, TrendingUp, Wallet } from 'lucide-react';
import OwnerLayout from '@/layouts/OwnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
    return (
        <OwnerLayout>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Ringkasan bisnis hari ini
                    </p>
                </div>

                {/* KPI Cards — placeholder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        { label: 'Omzet Hari Ini', value: 'Rp 0', icon: TrendingUp, color: 'text-emerald-600' },
                        { label: 'HPP Hari Ini', value: 'Rp 0', icon: Wallet, color: 'text-amber-600' },
                        { label: 'Pengeluaran Hari Ini', value: 'Rp 0', icon: Receipt, color: 'text-rose-600' },
                        { label: 'Laba Bersih Hari Ini', value: 'Rp 0', icon: BarChart3, color: 'text-indigo-600' },
                    ].map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <Card key={kpi.label}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        {kpi.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {kpi.value}
                                        </p>
                                        <Icon className={`w-8 h-8 ${kpi.color} opacity-80`} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Coming soon notice */}
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center">
                    <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Data dashboard akan tersedia setelah Phase 4 selesai
                    </p>
                </div>
            </div>
        </OwnerLayout>
    );
}
