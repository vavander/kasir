import { Head, Link } from '@inertiajs/react';
import { Ban, FileQuestion, ServerCrash, ShieldX } from 'lucide-react';
import ErrorState from '@/Components/ErrorState';
import { Button } from '@/Components/ui/button';

interface Props {
    status: number;
}

const messages: Record<number, { title: string; description: string; icon: typeof Ban }> = {
    403: { title: '403 — Akses Ditolak', description: 'Anda tidak memiliki izin untuk mengakses halaman ini.', icon: ShieldX },
    404: { title: '404 — Halaman Tidak Ditemukan', description: 'Halaman yang Anda cari tidak ada atau telah dipindahkan.', icon: FileQuestion },
    419: { title: '419 — Sesi Kedaluwarsa', description: 'Sesi Anda telah berakhir. Silakan muat ulang halaman.', icon: Ban },
    500: { title: '500 — Kesalahan Server', description: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.', icon: ServerCrash },
    503: { title: '503 — Sedang Pemeliharaan', description: 'Aplikasi sedang dalam pemeliharaan. Silakan kembali sebentar lagi.', icon: ServerCrash },
};

export default function ErrorPage({ status }: Props) {
    const info = messages[status] ?? messages[500];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
            <Head title={info.title} />
            <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <ErrorState
                    icon={info.icon}
                    title={info.title}
                    description={info.description}
                    action={
                        <Link href="/">
                            <Button>Kembali ke Beranda</Button>
                        </Link>
                    }
                />
            </div>
        </div>
    );
}
