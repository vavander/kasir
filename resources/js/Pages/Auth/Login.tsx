import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, UtensilsCrossed } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex">
                {/* Left — Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 flex-col items-center justify-center p-12 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full" />
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />
                    </div>

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 rounded-2xl mb-6 backdrop-blur-sm border border-white/20">
                            <UtensilsCrossed className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                            Restaurant POS
                        </h1>
                        <p className="text-orange-200 text-lg mb-8 max-w-xs">
                            Kelola restoran Anda dengan lebih mudah dan efisien
                        </p>

                        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                            {[
                                { label: 'Transaksi', desc: 'Cepat & akurat' },
                                { label: 'Laporan', desc: 'Realtime' },
                                { label: 'Menu', desc: 'Mudah dikelola' },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10"
                                >
                                    <p className="text-white font-semibold text-sm">{item.label}</p>
                                    <p className="text-orange-200 text-xs mt-0.5">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Restaurant POS
                            </span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Selamat datang kembali
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                Masuk ke akun Anda untuk melanjutkan
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    placeholder="owner@example.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-xs text-rose-500">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`pr-10 ${errors.password ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-rose-500">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked as false)}
                                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Ingat saya
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <a
                                        href={route('password.request')}
                                        className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                    >
                                        Lupa password?
                                    </a>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
                            © {new Date().getFullYear()} Restaurant POS. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
