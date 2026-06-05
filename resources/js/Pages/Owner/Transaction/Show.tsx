import { Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import TransactionDetail from '@/Components/transaction/TransactionDetail';
import { PageProps } from '@/types';

interface TransactionItem {
    menu_name: string;
    qty: number;
    selling_price: number;
    hpp: number;
    subtotal: number;
}

interface Props extends PageProps {
    transaction: {
        id: number;
        invoice_number: string;
        cashier_name: string;
        payment_method: string;
        subtotal: number;
        total: number;
        created_at: string;
        items: TransactionItem[];
    };
}

export default function OwnerTransactionShow({ transaction }: Props) {
    return (
        <OwnerLayout>
            <Head title={`Transaksi ${transaction.invoice_number}`} />

            <div className="p-6">
                <TransactionDetail
                    transaction={transaction}
                    backRoute="owner.transactions.index"
                    showHpp
                />
            </div>
        </OwnerLayout>
    );
}
