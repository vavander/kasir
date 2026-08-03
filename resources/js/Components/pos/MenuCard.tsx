import { ImageOff, Minus, Plus } from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';

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
    onIncrease: () => void;
    onDecrease: () => void;
}

export default function MenuCard({ menu, qty, onAdd, onIncrease, onDecrease }: MenuCardProps) {
    const selected = qty > 0;

    return (
        <div
            className={cn(
                'group relative flex flex-col rounded-xl border bg-white dark:bg-gray-900 overflow-hidden transition-all duration-150',
                selected
                    ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-md'
                    : 'border-gray-200 dark:border-gray-800 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md',
            )}
        >
            {/* Tap image + name to add one */}
            <button
                type="button"
                onClick={onAdd}
                className="flex flex-col text-left flex-1 active:scale-[0.98] transition-transform"
            >
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
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
                    {selected && (
                        <div className="absolute top-2 right-2 min-w-6 h-6 px-1.5 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                            {qty}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-2.5 pb-1.5">
                    <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem]">
                        {menu.name}
                    </p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1">
                        {formatRupiah(menu.selling_price)}
                    </p>
                </div>
            </button>

            {/* Action row — big touch targets */}
            <div className="px-2.5 pb-2.5">
                {selected ? (
                    <div className="flex items-center justify-between gap-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 p-1">
                        <button
                            type="button"
                            onClick={onDecrease}
                            aria-label="Kurangi"
                            className="w-10 h-10 rounded-md bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 active:scale-95 transition-transform"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center text-base font-bold text-gray-900 dark:text-white tabular-nums">
                            {qty}
                        </span>
                        <button
                            type="button"
                            onClick={onIncrease}
                            aria-label="Tambah"
                            className="w-10 h-10 rounded-md bg-orange-600 text-white flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="w-full h-10 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-orange-100 dark:hover:bg-orange-900 active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah
                    </button>
                )}
            </div>
        </div>
    );
}
