<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 28px; }
        .header { text-align: center; margin-bottom: 4px; }
        .store-name { font-size: 18px; font-weight: bold; }
        .muted { color: #6b7280; }
        .title { font-size: 14px; font-weight: bold; margin-top: 14px; }
        .period { margin-bottom: 12px; }
        .divider { border-top: 1px solid #e5e7eb; margin: 12px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { padding: 6px 8px; text-align: left; }
        th { background: #f3f4f6; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
        td { border-bottom: 1px solid #f3f4f6; }
        .right { text-align: right; }
        .section { margin-top: 18px; }
        .section-title { font-size: 12px; font-weight: bold; margin-bottom: 2px; }
        .summary-table td { border-bottom: 1px solid #f3f4f6; }
        .summary-table .label { color: #6b7280; }
        .summary-table .value { text-align: right; font-weight: bold; }
        .total-row td { border-top: 2px solid #111827; font-size: 13px; }
        .neg { color: #dc2626; }
        .footer { margin-top: 24px; text-align: center; font-size: 9px; color: #9ca3af; }
        .empty { color: #9ca3af; font-style: italic; padding: 8px; }
    </style>
</head>
@php
    $rp = fn ($n) => 'Rp ' . number_format((float) $n, 0, ',', '.');
@endphp
<body>
    <div class="header">
        <div class="store-name">{{ $setting->store_name }}</div>
        @if($setting->address)<div class="muted">{{ $setting->address }}</div>@endif
        @if($setting->phone)<div class="muted">Telp: {{ $setting->phone }}</div>@endif
    </div>

    <div class="divider"></div>

    <div class="title">Laporan Keuangan</div>
    <div class="period muted">Periode: {{ $range['label'] }}</div>

    <div class="section">
        <div class="section-title">Ringkasan</div>
        <table class="summary-table">
            <tr><td class="label">Omzet</td><td class="value">{{ $rp($report['summary']['omzet']) }}</td></tr>
            <tr><td class="label">HPP</td><td class="value">{{ $rp($report['summary']['hpp']) }}</td></tr>
            <tr><td class="label">Laba Kotor</td><td class="value">{{ $rp($report['summary']['laba_kotor']) }}</td></tr>
            <tr><td class="label">Pengeluaran</td><td class="value">{{ $rp($report['summary']['pengeluaran']) }}</td></tr>
            <tr class="total-row">
                <td class="label">Laba Bersih</td>
                <td class="value {{ $report['summary']['laba_bersih'] < 0 ? 'neg' : '' }}">{{ $rp($report['summary']['laba_bersih']) }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Rincian Harian</div>
        <table>
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th class="right">Omzet</th>
                    <th class="right">HPP</th>
                    <th class="right">Pengeluaran</th>
                    <th class="right">Laba Bersih</th>
                </tr>
            </thead>
            <tbody>
                @forelse($report['daily'] as $row)
                    <tr>
                        <td>{{ $row['label'] }}</td>
                        <td class="right">{{ $rp($row['omzet']) }}</td>
                        <td class="right">{{ $rp($row['hpp']) }}</td>
                        <td class="right">{{ $rp($row['pengeluaran']) }}</td>
                        <td class="right {{ $row['laba_bersih'] < 0 ? 'neg' : '' }}">{{ $rp($row['laba_bersih']) }}</td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="empty">Tidak ada data.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Pengeluaran per Kategori</div>
        <table>
            <thead><tr><th>Kategori</th><th class="right">Total</th></tr></thead>
            <tbody>
                @forelse($report['expense_by_category'] as $row)
                    <tr><td>{{ $row['category'] }}</td><td class="right">{{ $rp($row['total']) }}</td></tr>
                @empty
                    <tr><td colspan="2" class="empty">Tidak ada pengeluaran.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Menu Terlaris</div>
        <table>
            <thead><tr><th>Menu</th><th class="right">Qty Terjual</th><th class="right">Pendapatan</th></tr></thead>
            <tbody>
                @forelse($report['top_menus'] as $row)
                    <tr>
                        <td>{{ $row['menu_name'] }}</td>
                        <td class="right">{{ number_format($row['total_qty'], 0, ',', '.') }}</td>
                        <td class="right">{{ $rp($row['total_revenue']) }}</td>
                    </tr>
                @empty
                    <tr><td colspan="3" class="empty">Belum ada penjualan.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="footer">
        Dicetak pada {{ $generatedAt->format('d M Y, H:i') }} — {{ $setting->store_name }}
    </div>
</body>
</html>
