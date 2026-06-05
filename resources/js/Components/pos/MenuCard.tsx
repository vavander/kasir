import { ImageOff, Plus } from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface PosMenu {
    id: number;
    name: string;
    selling_price: number;
    image_url: string | null;
}

interface MenuCardProps {
    menu: PosMenu;
    qty: number;
    onAdd: () => void;
}

export default function MenuCard({ menu, qty, onAdd }: MenuCardProps) {
    return (
        <button
            onClick={onAdd}
            className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden text-left hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all duration-150 active:scale-[0.98]"
        >
            {/* Image */}
            <div className="aspect-square bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
                {menu.image_url ? (
                    <img
                        src={menu.image_url}
                        alt={menu.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                )}

                {/* Qty badge */}
                {qty > 0 && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                        {qty}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-2.5">
                <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem]">
                    {menu.name}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {formatRupiah(menu.selling_price)}
                    </p>
                    <div className="w-6 h-6 rounded-md bg-orange-50 dark:bg-orange-950 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    </div>
                </div>
            </div>
        </button>
    );
}
