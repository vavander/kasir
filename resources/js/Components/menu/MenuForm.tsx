import { useForm } from '@inertiajs/react';
import { ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { ChangeEvent, FormEventHandler, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatRupiah } from '@/lib/formatters';

interface MenuFormData {
    name: string;
    category: string;
    hpp: string;
    selling_price: string;
    image: File | null;
    is_active: boolean;
    _method?: string;
}

interface MenuFormProps {
    initialData?: {
        id?: number;
        name: string;
        category?: string | null;
        hpp: number;
        selling_price: number;
        image_url?: string | null;
        is_active: boolean;
    };
    submitRoute: string;
    mode: 'create' | 'edit';
}

const CATEGORY_SUGGESTIONS = ['Makanan', 'Minuman', 'Snack', 'Paket', 'Lainnya'];

export default function MenuForm({ initialData, submitRoute, mode }: MenuFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url ?? null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<MenuFormData>({
        name: initialData?.name ?? '',
        category: initialData?.category ?? '',
        hpp: initialData ? String(initialData.hpp) : '',
        selling_price: initialData ? String(initialData.selling_price) : '',
        image: null,
        is_active: initialData?.is_active ?? true,
        ...(mode === 'edit' ? { _method: 'PUT' } : {}),
    });

    const margin =
        data.selling_price && data.hpp
            ? parseFloat(data.selling_price) - parseFloat(data.hpp)
            : null;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('image', file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(submitRoute, { forceFormData: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Informasi Menu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Nama */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nama Menu <span className="text-rose-500">*</span></Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Nasi Goreng Spesial"
                            className={errors.name ? 'border-rose-500' : ''}
                        />
                        {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                    </div>

                    {/* Kategori */}
                    <div className="space-y-1.5">
                        <Label htmlFor="category">Kategori</Label>
                        <Input
                            id="category"
                            list="menu-category-suggestions"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            placeholder="Contoh: Makanan, Minuman"
                            className={errors.category ? 'border-rose-500' : ''}
                        />
                        <datalist id="menu-category-suggestions">
                            {CATEGORY_SUGGESTIONS.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                        {errors.category && <p className="text-xs text-rose-500">{errors.category}</p>}
                    </div>

                    {/* HPP dan Harga Jual */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="hpp">HPP (Harga Pokok) <span className="text-rose-500">*</span></Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                <Input
                                    id="hpp"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={data.hpp}
                                    onChange={(e) => setData('hpp', e.target.value)}
                                    placeholder="0"
                                    className={`pl-9 ${errors.hpp ? 'border-rose-500' : ''}`}
                                />
                            </div>
                            {errors.hpp && <p className="text-xs text-rose-500">{errors.hpp}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="selling_price">Harga Jual <span className="text-rose-500">*</span></Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                <Input
                                    id="selling_price"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={data.selling_price}
                                    onChange={(e) => setData('selling_price', e.target.value)}
                                    placeholder="0"
                                    className={`pl-9 ${errors.selling_price ? 'border-rose-500' : ''}`}
                                />
                            </div>
                            {errors.selling_price && <p className="text-xs text-rose-500">{errors.selling_price}</p>}
                        </div>
                    </div>

                    {/* Margin preview */}
                    {margin !== null && (
                        <div className={`text-sm px-3 py-2 rounded-lg ${margin >= 0 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
                            Margin: <span className="font-semibold">{formatRupiah(margin)}</span>
                            {data.selling_price && parseFloat(data.selling_price) > 0 && (
                                <span className="text-xs ml-1 opacity-70">
                                    ({((margin / parseFloat(data.selling_price)) * 100).toFixed(1)}%)
                                </span>
                            )}
                        </div>
                    )}

                    {/* Foto */}
                    <div className="space-y-1.5">
                        <Label>Foto Menu</Label>
                        <div
                            className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-40 w-full object-contain rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                        className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-6">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Klik untuk upload foto
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG, WebP — Maks. 5 MB
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpg,image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        {errors.image && <p className="text-xs text-rose-500">{errors.image}</p>}
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Status Menu</p>
                            <p className="text-xs text-muted-foreground">
                                Menu {data.is_active ? 'aktif' : 'nonaktif'} {data.is_active ? 'dan akan' : 'tidak akan'} muncul di halaman POS
                            </p>
                        </div>
                        <Switch
                            checked={data.is_active}
                            onCheckedChange={(val) => setData('is_active', val)}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {mode === 'create' ? 'Tambah Menu' : 'Simpan Perubahan'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
