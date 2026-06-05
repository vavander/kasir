import { useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
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

interface Props {
    cashierId: number;
    cashierName: string;
}

export default function ResetPasswordDialog({ cashierId, cashierName }: Props) {
    const [open, setOpen] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const close = () => {
        setOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('owner.cashiers.reset-password', cashierId), {
            preserveScroll: true,
            onSuccess: () => close(),
        });
    };

    return (
        <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
                <KeyRound className="w-3.5 h-3.5" /> Reset Password
            </Button>

            <AlertDialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
                <AlertDialogContent>
                    <form onSubmit={submit}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reset Password — {cashierName}</AlertDialogTitle>
                            <AlertDialogDescription>
                                Masukkan password baru untuk kasir ini.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-4 my-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="reset_password">Password Baru</Label>
                                <Input
                                    id="reset_password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    className={errors.password ? 'border-rose-500' : ''}
                                />
                                {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reset_password_confirmation">Konfirmasi Password</Label>
                                <Input
                                    id="reset_password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <AlertDialogFooter>
                            <Button type="button" variant="outline" onClick={close}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan Password</Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
