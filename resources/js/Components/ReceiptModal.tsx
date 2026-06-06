import { ExternalLink, Printer, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface Props {
    url: string | null;
    onClose: () => void;
}

export default function ReceiptModal({ url, onClose }: Props) {
    if (!url) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm h-[88vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-orange-500" />
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Struk</h2>
                    </div>
                    <div className="flex items-center gap-1">
                        <a href={url} target="_blank" rel="noopener noreferrer" title="Buka di tab baru">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-4 h-4" /></Button>
                        </a>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Tutup" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <iframe src={url} title="Struk" className="flex-1 w-full bg-gray-100 dark:bg-gray-800" />
            </div>
        </div>
    );
}
