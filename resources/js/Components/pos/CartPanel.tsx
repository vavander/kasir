import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/formatters';

export interface CartItem {
    menu_id: number;
    menu_name: string;
    selling_price: number;
    qty: number;
}

interface CartPanelProps {
    items: CartItem[];
    onIncrease: (menuId: number) => void;
    onDecrease: (menuId: number) => void;
    onRemove: (menuId: number) => void;
    onClear: () => void;
    onCheckout: () => void;
}

export default function CartPanel({
    items,
    onIncrease,
    onDecrease,
    onRemove,
    onClear,
    onCheckout,
}: CartPanelProps) {
    const totalItems = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.selling_price * i.qty, 0);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-indigo-600" />
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                        Keranjang
                    </h2>
                    {totalItems > 0 && (
                        <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {totalItems}
                        </span>
                    )}
                </div>
                {items.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Kosongkan
                    </button>
                )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <ShoppingCart className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3" />
                        <p className="text-sm text-muted-foreground">Keranjang kosong</p>
                        <p className="text-xs text-muted-foreground mt-1">Pilih menu di sebelah kiri</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map((item) => (
                            <div key={item.menu_id} className="px-4 py-3">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight line-clamp-2">
                                            {item.menu_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatRupiah(item.selling_price)} / pcs
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onRemove(item.menu_id)}
                                        className="text-gray-300 hover:text-rose-500 transition-colors shrink-0 mt-0.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onDecrease(item.menu_id)}
                                            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                            {item.qty}
                                        </span>
                                        <button
                                            onClick={() => onIncrease(item.menu_id)}
                                            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatRupiah(item.selling_price * item.qty)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-white dark:bg-gray-900">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{totalItems} item</span>
                        <span>Subtotal</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>
                </div>

                <Button
                    className="w-full h-11 text-base font-semibold gap-2"
                    disabled={items.length === 0}
                    onClick={onCheckout}
                >
                    Checkout
                </Button>
            </div>
        </div>
    );
}
