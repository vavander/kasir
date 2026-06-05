import { Head, usePage } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';
import CashierLayout from '@/Layouts/CashierLayout';
import { PageProps } from '@/types';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit() {
    const { auth, flash } = usePage<PageProps>().props;
    const Layout = auth.user.role === 'owner' ? OwnerLayout : CashierLayout;

    return (
        <Layout>
            <Head title="Profil Saya" />

            <div className="p-6 max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Kelola informasi akun Anda</p>
                </div>

                {flash?.success && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <UpdateProfileInformationForm />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <UpdatePasswordForm />
                </div>

                <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-gray-900 p-6">
                    <DeleteUserForm />
                </div>
            </div>
        </Layout>
    );
}
