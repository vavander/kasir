import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';

interface CashierFormProps {
    mode: 'create' | 'edit';
    submitRoute: string;
    initialData?: { name: string; email: string };
}

export default function CashierForm({ mode, submitRoute, initialData }: CashierFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (mode === 'create') {
            post(submitRoute);
        } else {
            put(submitRoute);
        }
    };

    return (
        <form onSubmit={submit} className="max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{mode === 'create' ? 'Data Kasir Baru' : 'Edit Data Kasir'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nama <span className="text-rose-500">*</span></Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Nama kasir"
                            className={errors.name ? 'border-rose-500' : ''}
                        />
                        {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email <span className="text-rose-500">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="kasir@example.com"
                            className={errors.email ? 'border-rose-500' : ''}
                        />
                        {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                    </div>

                    {mode === 'create' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password <span className="text-rose-500">*</span></Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    className={errors.password ? 'border-rose-500' : ''}
                                />
                                {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">Konfirmasi Password <span className="text-rose-500">*</span></Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        {mode === 'create' ? 'Tambah Kasir' : 'Simpan Perubahan'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={processing}>
                        Batal
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
