import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function UpdatePasswordForm() {
    const currentInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, errors, processing, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (err) => {
                if (err.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (err.current_password) {
                    reset('current_password');
                    currentInput.current?.focus();
                }
            },
        });
    };

    return (
        <section>
            <header className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ganti Password</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Gunakan password yang panjang dan acak agar tetap aman.</p>
            </header>

            <form onSubmit={submit} className="space-y-6 max-w-md">
                <div className="space-y-1.5">
                    <Label htmlFor="current_password">Password Saat Ini</Label>
                    <Input
                        id="current_password"
                        ref={currentInput}
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        className={errors.current_password ? 'border-rose-500' : ''}
                    />
                    {errors.current_password && <p className="text-xs text-rose-500">{errors.current_password}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password Baru</Label>
                    <Input
                        id="password"
                        ref={passwordInput}
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        className={errors.password ? 'border-rose-500' : ''}
                    />
                    {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        className={errors.password_confirmation ? 'border-rose-500' : ''}
                    />
                    {errors.password_confirmation && <p className="text-xs text-rose-500">{errors.password_confirmation}</p>}
                </div>

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        Simpan Password
                    </Button>
                    {recentlySuccessful && <p className="text-sm text-emerald-600 dark:text-emerald-400">Tersimpan.</p>}
                </div>
            </form>
        </section>
    );
}
