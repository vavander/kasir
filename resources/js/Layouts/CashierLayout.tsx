import { Link, router, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Clock,
    LayoutDashboard,
    LogOut,
    Receipt,
    ShoppingCart,
    UtensilsCrossed,
    User,
} from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import Toaster from '@/Components/Toaster';
import ThemeToggle from '@/Components/ThemeToggle';
import { PageProps } from '@/types';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Beranda', href: 'cashier.dashboard', icon: LayoutDashboard },
    { label: 'POS', href: 'cashier.pos', icon: ShoppingCart },
    { label: 'Pending', href: 'cashier.pending.index', icon: Clock },
    { label: 'Transaksi', href: 'cashier.transactions.index', icon: ClipboardList },
    { label: 'Pengeluaran', href: 'cashier.expenses.index', icon: Receipt },
];

export default function CashierLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const currentRoute = route().current();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            <Toaster />
            {/* Top Navbar */}
            <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 fixed top-0 inset-x-0 z-30">
                {/* Logo */}
                <div className="flex items-center gap-2.5 mr-4">
                    <div className="w-7 h-7 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-white text-sm hidden sm:block">
                        Restaurant POS
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-1 flex-1">
                    {navItems.map((item) => {
                        const isActive = currentRoute === item.href;
                        const Icon = item.icon;

                        let href = '#';
                        try {
                            href = route(item.href);
                        } catch {
                            // route not registered yet (placeholder phase)
                        }

                        return (
                            <Link
                                key={item.href}
                                href={href}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                                )}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:block">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <ThemeToggle className="ml-auto" />

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <div className="w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center overflow-hidden">
                            {auth.user.avatar_url ? (
                                <img src={auth.user.avatar_url} alt={auth.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-3.5 h-3.5 text-orange-400" />
                            )}
                        </div>
                        <span className="text-sm font-medium text-white hidden sm:block">
                            {auth.user.name}
                        </span>
                    </button>

                    {userMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => setUserMenuOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                Profil Saya
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 mt-14">
                {children}
            </main>
        </div>
    );
}
