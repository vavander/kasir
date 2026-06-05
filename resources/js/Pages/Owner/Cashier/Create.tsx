import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import CashierForm from '@/Components/cashier/CashierForm';

export default function CashierCreate() {
    return (
        <OwnerLayout>
            <Head title="Tambah Kasir" />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('owner.cashiers.index')} className="text-muted-foreground hover:text-gray-900 dark:hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Kasir</h1>
                </div>
                <CashierForm mode="create" submitRoute={route('owner.cashiers.store')} />
            </div>
        </OwnerLayout>
    );
}
