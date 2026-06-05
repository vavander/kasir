import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import MenuForm from '@/components/menu/MenuForm';

export default function MenuCreate() {
    return (
        <OwnerLayout>
            <Head title="Tambah Menu" />

            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('owner.menus.index')}
                        className="text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Menu</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Tambahkan menu baru ke dalam daftar
                        </p>
                    </div>
                </div>

                <MenuForm
                    submitRoute={route('owner.menus.store')}
                    mode="create"
                />
            </div>
        </OwnerLayout>
    );
}
