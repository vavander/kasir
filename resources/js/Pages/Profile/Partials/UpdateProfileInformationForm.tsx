import { useForm, usePage } from '@inertiajs/react';
import { Loader2, Trash2, Upload, UserRound } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { PageProps } from '@/types';

export default function UpdateProfileInformationForm() {
    const user = usePage<PageProps>().props.auth.user;
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm<{
        _method: 'patch';
        name: string;
        email: string;
        avatar: File | null;
        remove_avatar: boolean;
    }>({
        _method: 'patch',
        name: user.name,
        email: user.email,
        avatar: null,
        remove_avatar: false,
    });

    const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData((prev) => ({ ...prev, avatar: file, remove_avatar: false }));
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const removePhoto = () => {
        setData((prev) => ({ ...prev, avatar: null, remove_avatar: true }));
        setPreview(null);
        if (fileInput.current) fileInput.current.value = '';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const shownAvatar = preview ?? (data.remove_avatar ? null : user.avatar_url);

    return (
        <section>
            <header className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informasi Profil</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Perbarui nama, email, dan foto profil Anda.</p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-800">
                        {shownAvatar ? (
                            <img src={shownAvatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserRound className="w-9 h-9 text-indigo-500 dark:text-indigo-300" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInput.current?.click()}>
                                <Upload className="w-4 h-4" /> Unggah Foto
                            </Button>
                            {shownAvatar && (
                                <Button type="button" variant="ghost" size="sm" className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950" onClick={removePhoto}>
                                    <Trash2 className="w-4 h-4" /> Hapus
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">JPG, PNG, atau WEBP. Maks 5MB.</p>
                        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFile} />
                    </div>
                </div>
                {errors.avatar && <p className="text-xs text-rose-500 -mt-2">{errors.avatar}</p>}

                <div className="space-y-1.5">
                    <Label htmlFor="name">Nama <span className="text-rose-500">*</span></Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
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
                        required
                        autoComplete="username"
                        className={errors.email ? 'border-rose-500' : ''}
                    />
                    {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                </div>

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        Simpan Perubahan
                    </Button>
                    {recentlySuccessful && <p className="text-sm text-emerald-600 dark:text-emerald-400">Tersimpan.</p>}
                </div>
            </form>
        </section>
    );
}
