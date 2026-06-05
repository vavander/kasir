import { Head } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import PendingTable from '@/Components/payment/PendingTable';
import { PageProps } from '@/types';

interface Props extends PageProps {
    pending: { data: any[]; [key: string]: any };
    filters: { search: string; date?: string };
}

export default function CashierPendingIndex({ pending, filters }: Props) {
    return (
        <CashierLayout>
            <Head title="Pending Payments" />
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pesanan Belum Bayar</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Semua pesanan yang belum dilunasi (termasuk shift sebelumnya)</p>
                </div>
                <PendingTable
                    pending={pending}
                    filters={filters}
                    indexRoute={route('cashier.pending.index')}
                    settleRouteName="cashier.pending.settle"
                    showCashier
                />
            </div>
        </CashierLayout>
    );
}
