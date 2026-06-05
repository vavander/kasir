import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

const CATEGORIES = ['Bahan Baku', 'Gas', 'Listrik', 'Transport', 'Lainnya'] as const;

interface ExpenseFormProps {
    initialData?: {
        category: string;
        amount: number;
        description?: string;
        expense_date: string;
    };
    submitRoute: string;
    method?: 'post' | 'put';
    onSuccess?: () => void;
    compact?: boolean;
}

export default function ExpenseForm({
    initialData,
    submitRoute,
    method = 'post',
    onSuccess,
    compact = false,
}: ExpenseFormProps) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, put, processing, errors, reset } = useForm({
        category: initialData?.category ?? '',
        amount: initialData?.amount ? String(initialData.amount) : '',
        description: initialData?.description ?? '',
        expense_date: initialData?.expense_date ?? today,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const action = method === 'put' ? put : post;
        action(submitRoute, {
            preserveScroll: true,
            onSuccess: () => {
                if (!initialData) reset();
                onSuccess?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className={compact ? 'grid grid-cols-2 gap-3' : 'space-y-4'}>
                {/* Tanggal */}
                <div className="space-y-1.5">
                    <Label htmlFor="expense_date">
                        Tanggal <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="expense_date"
                        type="date"
                        max={today}
                        value={data.expense_date}
                        onChange={(e) => setData('expense_date', e.target.value)}
                        className={errors.expense_date ? 'border-rose-500' : ''}
                    />
                    {errors.expense_date && (
                        <p className="text-xs text-rose-500">{errors.expense_date}</p>
                    )}
                </div>

                {/* Kategori */}
                <div className="space-y-1.5">
                    <Label>
                        Kategori <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                        value={data.category}
                        onValueChange={(val) => setData('category', val)}
                    >
                        <SelectTrigger className={errors.category ? 'border-rose-500' : ''}>
                            <SelectValue placeholder="Pilih kategori..." />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category && (
                        <p className="text-xs text-rose-500">{errors.category}</p>
                    )}
                </div>

                {/* Nominal */}
                <div className="space-y-1.5">
                    <Label htmlFor="amount">
                        Nominal <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            Rp
                        </span>
                        <Input
                            id="amount"
                            type="number"
                            min="1"
                            step="100"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="0"
                            className={`pl-9 ${errors.amount ? 'border-rose-500' : ''}`}
                        />
                    </div>
                    {errors.amount && (
                        <p className="text-xs text-rose-500">{errors.amount}</p>
                    )}
                </div>

                {/* Keterangan */}
                <div className={`space-y-1.5 ${compact ? 'col-span-2' : ''}`}>
                    <Label htmlFor="description">Keterangan</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Opsional..."
                        rows={compact ? 2 : 3}
                        className={errors.description ? 'border-rose-500' : ''}
                    />
                    {errors.description && (
                        <p className="text-xs text-rose-500">{errors.description}</p>
                    )}
                </div>
            </div>

            <Button type="submit" disabled={processing} className="gap-2 w-full">
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                {initialData ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
            </Button>
        </form>
    );
}
