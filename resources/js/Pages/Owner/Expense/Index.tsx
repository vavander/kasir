import { Head, router, usePage } from '@inertiajs/react';
import { Edit2, Receipt, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import EmptyState from '@/Components/EmptyState';
import ExpenseForm from '@/Components/expense/ExpenseForm';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
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
import { formatRupiah } from '@/lib/formatters';
import { PageProps } from '@/types';

interface Expense {
    id: number;
    category: string;
    amount: number;
    description?: string;
    expense_date: string;
    user?: { id: number; name: string };
    created_by?: string;
}

interface Summary {
    today: number;
    this_month: number;
}

interface Props extends PageProps {
    expenses: { data: Expense[]; [key: string]: any };
    summary: Summary;
    filters: { search: string };
}

const categoryColors: Record<string, string> = {
    'Bahan Baku': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    Gas: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    Listrik: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Lainnya: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function OwnerExpenseIndex({ expenses, summary, filters }: Props) {
    const { auth, flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [editing, setEditing] = useState<Expense | null>(null);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            router.get(route('owner.expenses.index'), { search }, { preserveState: true, replace: true });
        }, 300);
        return () => { if (timeout.current) clearTimeout(timeout.current); };
    }, [search]);

    return (
        <OwnerLayout>
            <Head title="Pengeluaran" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengeluaran</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Semua pengeluaran operasional</p>
                </div>

                {flash?.success && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                        {flash.success}
                    </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Hari Ini</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatRupiah(summary.today)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Bulan Ini</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatRupiah(summary.this_month)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add form */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                                {editing ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
                            </h2>
                            {editing ? (
                                <>
                                    <ExpenseForm
                                        key={editing.id}
                                        initialData={{
                                            category: editing.category,
                                            amount: editing.amount,
                                            description: editing.description,
                                            expense_date: editing.expense_date,
                                        }}
                                        submitRoute={route('owner.expenses.update', editing.id)}
                                        method="put"
                                        onSuccess={() => setEditing(null)}
                                        compact
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-2 text-muted-foreground"
                                        onClick={() => setEditing(null)}
                                    >
                                        Batal edit
                                    </Button>
                                </>
                            ) : (
                                <ExpenseForm
                                    submitRoute={route('owner.expenses.store')}
                                    compact
                                />
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari kategori atau keterangan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kategori</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Nominal</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Dibuat Oleh</th>
                                        <th className="text-center px-4 py-3 font-medium text-muted-foreground w-20">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {expenses.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <EmptyState
                                                    icon={Receipt}
                                                    title="Belum ada pengeluaran"
                                                    description="Pengeluaran yang dicatat akan muncul di sini."
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.data.map((expense: any) => (
                                            <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                    {expense.expense_date}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[expense.category] ?? categoryColors['Lainnya']}`}>
                                                        {expense.category}
                                                    </span>
                                                    {expense.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">
                                                            {expense.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                                                    {formatRupiah(expense.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                                                    {expense.user?.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {expense.user?.id === auth.user.id && (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => setEditing(expense)}
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Hapus Pengeluaran</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Yakin ingin menghapus pengeluaran ini?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-rose-600 hover:bg-rose-700"
                                                                            onClick={() => router.delete(route('owner.expenses.destroy', expense.id), { preserveScroll: true })}
                                                                        >
                                                                            Hapus
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
}
