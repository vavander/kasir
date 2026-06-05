export function formatRupiah(amount: number): string {
    if (amount < 0) {
        return '-' + formatRupiah(Math.abs(amount));
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export function formatCompact(amount: number): string {
    if (Math.abs(amount) >= 1_000_000_000) {
        return 'Rp ' + (amount / 1_000_000_000).toFixed(1) + 'M';
    }
    if (Math.abs(amount) >= 1_000_000) {
        return 'Rp ' + (amount / 1_000_000).toFixed(1) + 'jt';
    }
    if (Math.abs(amount) >= 1_000) {
        return 'Rp ' + (amount / 1_000).toFixed(0) + 'rb';
    }
    return formatRupiah(amount);
}
