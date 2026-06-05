import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCompact, formatRupiah } from '@/lib/formatters';

interface ChartDataItem {
    date: string;
    total: number;
}

interface SalesChartProps {
    data: ChartDataItem[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatRupiah(payload[0].value)}
            </p>
        </div>
    );
}

export default function SalesChart({ data }: SalesChartProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                    Penjualan 7 Hari Terakhir
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: 'currentColor' }}
                            className="text-gray-500 dark:text-gray-400"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tickFormatter={(v) => formatCompact(v)}
                            tick={{ fontSize: 10, fill: 'currentColor' }}
                            className="text-gray-500 dark:text-gray-400"
                            tickLine={false}
                            axisLine={false}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#salesGradient)"
                            dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
