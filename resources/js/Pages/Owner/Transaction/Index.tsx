import { Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import TransactionTable from '@/components/transaction/TransactionTable';
import { PageProps } from '@/types';

interface Props extends PageProps {
    transactions: any;
    filters: { search: string };
}

export default function OwnerTransactionIndex({ transactions, filters }: Props) {
    return (
        <OwnerLayout>
            <Head title="Semua Transaksi" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Semua Transaksi
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {transactions.total} total transaksi
                    </p>
                </div>

                <TransactionTable
                    transactions={transactions}
                    filters={filters}
                    showCashier
                    indexRoute={route('owner.transactions.index')}
                    showRoute="owner.transactions.show"
                    showReceiptButton
                />
            </div>
        </OwnerLayout>
    );
}
