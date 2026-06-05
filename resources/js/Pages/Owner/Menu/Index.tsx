import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit2, ImageOff, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatRupiah } from '@/lib/formatters';
import { PageProps } from '@/types';

interface Menu {
    id: number;
    name: string;
    hpp: number;
    selling_price: number;
    image_url: string | null;
    is_active: boolean;
}

interface PaginatedMenus {
    data: Menu[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface MenuIndexProps extends PageProps {
    menus: PaginatedMenus;
    filters: { search: string };
}

export default function MenuIndex({ menus, filters }: MenuIndexProps) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(route('owner.menus.index'), { search }, { preserveState: true, replace: true });
        }, 300);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [search]);

    const handleToggle = (menu: Menu) => {
        router.patch(route('owner.menus.toggle-status', menu.id), {}, { preserveScroll: true });
    };

    const profit = (menu: Menu) => menu.selling_price - menu.hpp;

    return (
        <OwnerLayout>
            <Head title="Manajemen Menu" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {menus.total} menu terdaftar
                        </p>
                    </div>
                    <Link href={route('owner.menus.create')}>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Tambah Menu
                        </Button>
                    </Link>
                </div>

                {/* Flash message */}
                {flash?.success && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                        {flash.success}
                    </div>
                )}

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama menu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-16">Foto</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama Menu</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">HPP</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Harga Jual</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Margin</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {menus.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                                        <ImageOff className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p>
                                            {search
                                                ? `Tidak ada menu dengan nama "${search}"`
                                                : 'Belum ada menu. Tambahkan menu pertama Anda.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                menus.data.map((menu) => (
                                    <tr key={menu.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            {menu.image_url ? (
                                                <img
                                                    src={menu.image_url}
                                                    alt={menu.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <ImageOff className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                            {menu.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">
                                            {formatRupiah(menu.hpp)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                            {formatRupiah(menu.selling_price)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={profit(menu) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                                {formatRupiah(profit(menu))}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Switch
                                                    checked={menu.is_active}
                                                    onCheckedChange={() => handleToggle(menu)}
                                                />
                                                <Badge variant={menu.is_active ? 'success' : 'secondary'}>
                                                    {menu.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link href={route('owner.menus.edit', menu.id)}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus Menu</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Yakin ingin menghapus menu <strong>{menu.name}</strong>?
                                                                Tindakan ini tidak dapat dibatalkan.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-rose-600 hover:bg-rose-700"
                                                                onClick={() => router.delete(route('owner.menus.destroy', menu.id))}
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {menus.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            Menampilkan {(menus.current_page - 1) * menus.per_page + 1}–
                            {Math.min(menus.current_page * menus.per_page, menus.total)} dari {menus.total} menu
                        </p>
                        <div className="flex gap-1">
                            {menus.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={[
                                        'px-3 py-1 rounded-md text-xs transition-colors',
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed',
                                    ].join(' ')}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </OwnerLayout>
    );
}
