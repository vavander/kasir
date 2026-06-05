import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import MenuForm from '@/Components/menu/MenuForm';
import { PageProps } from '@/types';

interface MenuData {
    id: number;
    name: string;
    hpp: number;
    selling_price: number;
    image_url: string | null;
    is_active: boolean;
}

interface MenuEditProps extends PageProps {
    menu: MenuData;
}

export default function MenuEdit({ menu }: MenuEditProps) {
    return (
        <OwnerLayout>
            <Head title={`Edit ${menu.name}`} />

            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('owner.menus.index')}
                        className="text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Menu</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {menu.name}
                        </p>
                    </div>
                </div>

                <MenuForm
                    initialData={menu}
                    submitRoute={route('owner.menus.update', menu.id)}
                    mode="edit"
                />
            </div>
        </OwnerLayout>
    );
}
