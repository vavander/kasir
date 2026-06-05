import { Head, usePage } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import TransactionTable from '@/Components/transaction/TransactionTable';
import { PageProps } from '@/types';

interface Props extends PageProps {
    transactions: any;
    filters: { search: string; date?: string };
}

export default function CashierTransactionIndex({ transactions, filters }: Props) {
    const { auth } = usePage<PageProps>().props;

    return (
        <CashierLayout>
            <Head title="Riwayat Transaksi" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Riwayat Transaksi
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Transaksi milik {auth.user.name}
                    </p>
                </div>

                <TransactionTable
                    transactions={transactions}
                    filters={filters}
                    showCashier={false}
                    indexRoute={route('cashier.transactions.index')}
                    showRoute="cashier.transactions.show"
                    showReceiptButton
                    showDateFilter
                />
            </div>
        </CashierLayout>
    );
}
