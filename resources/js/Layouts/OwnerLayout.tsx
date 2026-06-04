import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Receipt,
    Settings,
    ShoppingBag,
    UtensilsCrossed,
    User,
} from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import { PageProps } from '@/types';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', href: 'owner.dashboard', icon: LayoutDashboard },
    { label: 'Menu', href: 'owner.menus.index', icon: ShoppingBag },
    { label: 'Pengeluaran', href: 'owner.expenses.index', icon: Receipt },
    { label: 'Laporan', href: 'owner.reports.index', icon: BarChart3 },
    { label: 'Pengaturan', href: 'owner.settings.index', icon: Settings },
];

export default function OwnerLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const currentRoute = route().current();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed inset-y-0 z-30">
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        Restaurant POS
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                                )}
                            >
                                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-indigo-600 dark:text-indigo-400' : '')} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Menu */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    Owner
                                </p>
                            </div>
                            <ChevronDown className={cn('w-4 h-4 text-gray-400 shrink-0 transition-transform', userMenuOpen ? 'rotate-180' : '')} />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
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
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
