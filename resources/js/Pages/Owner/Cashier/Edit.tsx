import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import CashierForm from '@/Components/cashier/CashierForm';
import { PageProps } from '@/types';

interface Props extends PageProps {
    cashier: { id: number; name: string; email: string };
}

export default function CashierEdit({ cashier }: Props) {
    return (
        <OwnerLayout>
            <Head title="Edit Kasir" />
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('owner.cashiers.index')} className="text-muted-foreground hover:text-gray-900 dark:hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Kasir</h1>
                </div>
                <CashierForm
                    mode="edit"
                    submitRoute={route('owner.cashiers.update', cashier.id)}
                    initialData={{ name: cashier.name, email: cashier.email }}
                />
            </div>
        </OwnerLayout>
    );
}
