import { Head } from '@inertiajs/react';
import { ShoppingCart, UtensilsCrossed } from 'lucide-react';
import CashierLayout from '@/layouts/CashierLayout';

export default function Pos() {
    return (
        <CashierLayout>
            <Head title="POS" />

            <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Sistem POS
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tampilan POS akan tersedia setelah Phase 6 selesai
                    </p>
                </div>
            </div>
        </CashierLayout>
    );
}
