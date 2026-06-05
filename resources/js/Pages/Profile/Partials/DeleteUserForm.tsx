import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';

export default function DeleteUserForm() {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const closeModal = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <section>
            <header className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hapus Akun</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Setelah akun dihapus, seluruh data akan hilang permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </header>

            <Button variant="destructive" onClick={() => setOpen(true)}>
                Hapus Akun
            </Button>

            <AlertDialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeModal())}>
                <AlertDialogContent>
                    <form onSubmit={deleteUser}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Yakin ingin menghapus akun?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Masukkan password untuk mengonfirmasi penghapusan akun secara permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-1.5 my-4">
                            <Label htmlFor="delete_password" className="sr-only">Password</Label>
                            <Input
                                id="delete_password"
                                ref={passwordInput}
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                className={errors.password ? 'border-rose-500' : ''}
                            />
                            {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                        </div>

                        <AlertDialogFooter>
                            <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                            <Button type="submit" variant="destructive" disabled={processing}>Hapus Akun</Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
