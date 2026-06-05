import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { useCallback, useMemo, useReducer, useState } from 'react';
import CashierLayout from '@/Layouts/CashierLayout';
import { Input } from '@/Components/ui/input';
import MenuCard from '@/Components/pos/MenuCard';
import CartPanel, { CartItem } from '@/Components/pos/CartPanel';
import CheckoutModal from '@/Components/pos/CheckoutModal';
import SuccessScreen from '@/Components/pos/SuccessScreen';
import { PageProps } from '@/types';

interface PosMenu {
    id: number;
    name: string;
    selling_price: number;
    image_url: string | null;
}

interface PosProps extends PageProps {
    menus: PosMenu[];
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

export default function Pos({ menus }: PosProps) {
    const [cart, dispatch] = useReducer(cartReducer, []);
    const [search, setSearch] = useState('');
    const [screen, setScreen] = useState<Screen>('pos');
    const [processing, setProcessing] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<any>(null);
    const [lastPaidAmount, setLastPaidAmount] = useState(0);

    const { props } = usePage<PosProps>();

    const filtered = useMemo(() => {
        if (!search.trim()) return menus;
        const q = search.toLowerCase();
        return menus.filter((m) => m.name.toLowerCase().includes(q));
    }, [menus, search]);

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
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
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
                    </div>

                    {/* Menu grid */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p className="text-sm text-muted-foreground">
                                    {search ? `Tidak ada menu "${search}"` : 'Tidak ada menu aktif'}
                                </p>
                            </div>
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
