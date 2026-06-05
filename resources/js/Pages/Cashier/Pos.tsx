import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { useCallback, useMemo, useReducer, useState } from 'react';
import CashierLayout from '@/Layouts/CashierLayout';
import EmptyState from '@/Components/EmptyState';
import { Input } from '@/Components/ui/input';
import MenuCard from '@/Components/pos/MenuCard';
import CartPanel, { CartItem } from '@/Components/pos/CartPanel';
import CheckoutModal from '@/Components/pos/CheckoutModal';
import SuccessScreen from '@/Components/pos/SuccessScreen';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

interface PosMenu {
    id: number;
    name: string;
    category: string | null;
    selling_price: number;
    image_url: string | null;
}

interface PosProps extends PageProps {
    menus: PosMenu[];
    categories: string[];
}

type CartAction =
    | { type: 'ADD'; menu: PosMenu }
    | { type: 'INCREASE'; menuId: number }
    | { type: 'DECREASE'; menuId: number }
    | { type: 'REMOVE'; menuId: number }
    | { type: 'CLEAR' };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
    switch (action.type) {
        case 'ADD': {
            const existing = state.find((i) => i.menu_id === action.menu.id);
            if (existing) {
                return state.map((i) =>
                    i.menu_id === action.menu.id ? { ...i, qty: i.qty + 1 } : i,
                );
            }
            return [...state, {
                menu_id: action.menu.id,
                menu_name: action.menu.name,
                selling_price: action.menu.selling_price,
                qty: 1,
            }];
        }
        case 'INCREASE':
            return state.map((i) => i.menu_id === action.menuId ? { ...i, qty: i.qty + 1 } : i);
        case 'DECREASE':
            return state
                .map((i) => i.menu_id === action.menuId ? { ...i, qty: i.qty - 1 } : i)
                .filter((i) => i.qty > 0);
        case 'REMOVE':
            return state.filter((i) => i.menu_id !== action.menuId);
        case 'CLEAR':
            return [];
        default:
            return state;
    }
}

type Screen = 'pos' | 'checkout' | 'success';

export default function Pos({ menus, categories }: PosProps) {
    const [cart, dispatch] = useReducer(cartReducer, []);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [screen, setScreen] = useState<Screen>('pos');
    const [processing, setProcessing] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<any>(null);
    const [lastPaidAmount, setLastPaidAmount] = useState(0);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return menus.filter((m) => {
            const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
            const matchesSearch = !q || m.name.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [menus, search, activeCategory]);

    const cartQty = useCallback(
        (menuId: number) => cart.find((i) => i.menu_id === menuId)?.qty ?? 0,
        [cart],
    );

    const total = useMemo(() => cart.reduce((s, i) => s + i.selling_price * i.qty, 0), [cart]);

    const handleCheckout = async (paymentMethod: 'cash' | 'qris' | 'transfer', paidAmount: number) => {
        setProcessing(true);
        try {
            const res = await axios.post(route('cashier.pos.checkout'), {
                items: cart.map((i) => ({ menu_id: i.menu_id, qty: i.qty })),
                payment_method: paymentMethod,
                paid_amount: paidAmount,
            });
            setLastTransaction(res.data.transaction);
            setLastPaidAmount(paidAmount);
            setScreen('success');
            dispatch({ type: 'CLEAR' });
        } catch (err: any) {
            alert(err.response?.data?.message ?? 'Checkout gagal. Coba lagi.');
        } finally {
            setProcessing(false);
        }
    };

    if (screen === 'success' && lastTransaction) {
        return (
            <CashierLayout>
                <Head title="Transaksi Berhasil" />
                <div className="h-[calc(100vh-3.5rem)]">
                    <SuccessScreen
                        transaction={lastTransaction}
                        paidAmount={lastPaidAmount}
                        onNewTransaction={() => setScreen('pos')}
                    />
                </div>
            </CashierLayout>
        );
    }

    return (
        <CashierLayout>
            <Head title="POS" />

            <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row overflow-hidden">
                {/* Left — Menu section */}
                <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-800">
                    {/* Search bar */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari menu..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                                autoFocus
                            />
                        </div>

                        {/* Category rail */}
                        {categories.length > 0 && (
                            <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mb-0.5">
                                {['all', ...categories].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setActiveCategory(cat)}
                                        className={cn(
                                            'shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                            activeCategory === cat
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                                        )}
                                    >
                                        {cat === 'all' ? 'Semua' : cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Menu grid */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {filtered.length === 0 ? (
                            <EmptyState
                                title={search ? 'Menu tidak ditemukan' : 'Tidak ada menu'}
                                description={search
                                    ? `Tidak ada menu dengan kata "${search}".`
                                    : 'Belum ada menu aktif pada kategori ini.'}
                            />
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
                                {filtered.map((menu) => (
                                    <MenuCard
                                        key={menu.id}
                                        menu={menu}
                                        qty={cartQty(menu.id)}
                                        onAdd={() => dispatch({ type: 'ADD', menu })}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Cart */}
                <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col bg-white dark:bg-gray-900 border-t lg:border-t-0 border-gray-200 dark:border-gray-800 h-64 lg:h-full">
                    <CartPanel
                        items={cart}
                        onIncrease={(id) => dispatch({ type: 'INCREASE', menuId: id })}
                        onDecrease={(id) => dispatch({ type: 'DECREASE', menuId: id })}
                        onRemove={(id) => dispatch({ type: 'REMOVE', menuId: id })}
                        onClear={() => dispatch({ type: 'CLEAR' })}
                        onCheckout={() => setScreen('checkout')}
                    />
                </div>
            </div>

            {/* Checkout modal */}
            {screen === 'checkout' && (
                <CheckoutModal
                    items={cart}
                    total={total}
                    onConfirm={handleCheckout}
                    onCancel={() => setScreen('pos')}
                    processing={processing}
                />
            )}
        </CashierLayout>
    );
}
