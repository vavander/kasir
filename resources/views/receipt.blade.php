<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #000;
            width: 100%;
            padding: 8px;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .store-name { font-size: 14px; font-weight: bold; }
        .table { width: 100%; }
        .table td { padding: 1px 0; vertical-align: top; }
        .table .name { width: 55%; }
        .table .qty { width: 10%; text-align: center; }
        .table .price { width: 35%; text-align: right; }
        .summary td { padding: 2px 0; }
        .summary .label { width: 55%; }
        .summary .value { width: 45%; text-align: right; }
        .total-row { font-weight: bold; font-size: 12px; }
        .footer { margin-top: 8px; text-align: center; font-size: 10px; }
        .logo { width: 60px; height: 60px; margin-bottom: 4px; }
    </style>
</head>
@php
    // dompdf needs the GD extension to embed raster images; skip the logo if it's
    // unavailable so the receipt still prints (logo appears once GD is enabled).
    $logoData = null;
    $logoPath = public_path('logo.png');
    if (extension_loaded('gd') && is_file($logoPath)) {
        $logoData = 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath));
    }
@endphp
<body>
    <div class="center">
        @if($logoData)
            <img class="logo" src="{{ $logoData }}" alt="Logo">
        @endif
        <div class="store-name">{{ $setting->store_name }}</div>
        @if($setting->address)
            <div>{{ $setting->address }}</div>
        @endif
        @if($setting->phone)
            <div>Telp: {{ $setting->phone }}</div>
        @endif
    </div>

    <div class="divider"></div>

    <table style="width:100%">
        <tr>
            <td>No Invoice</td>
            <td class="right">{{ $transaction->invoice_number }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td class="right">{{ $transaction->created_at->format('d/m/Y H:i') }}</td>
        </tr>
        <tr>
            <td>Kasir</td>
            <td class="right">{{ $transaction->cashier->name }}</td>
        </tr>
        <tr>
            <td>Pelanggan</td>
            <td class="right">{{ $transaction->customer_name ?? '-' }}</td>
        </tr>
        <tr>
            <td>Pembayaran</td>
            <td class="right">{{ $transaction->payment_method?->label() ?? 'Belum Bayar' }}</td>
        </tr>
    </table>

    <div class="divider"></div>

    <table class="table">
        <thead>
            <tr>
                <td class="name bold">Item</td>
                <td class="qty bold">Qty</td>
                <td class="price bold">Harga</td>
            </tr>
        </thead>
        <tbody>
            @foreach($transaction->items as $item)
            <tr>
                <td class="name">{{ $item->menu_name }}</td>
                <td class="qty">{{ $item->qty }}</td>
                <td class="price">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td colspan="3" style="font-size:10px;color:#555;padding-left:4px">
                    {{ $item->qty }} x {{ number_format($item->selling_price, 0, ',', '.') }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="divider"></div>

    <table class="summary" style="width:100%">
        <tr>
            <td class="label">Subtotal</td>
            <td class="value">Rp {{ number_format($transaction->subtotal, 0, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
            <td class="label">TOTAL</td>
            <td class="value">Rp {{ number_format($transaction->total, 0, ',', '.') }}</td>
        </tr>
        @if($paid_amount > 0)
        <tr>
            <td class="label">Bayar</td>
            <td class="value">Rp {{ number_format($paid_amount, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Kembalian</td>
            <td class="value">Rp {{ number_format($change, 0, ',', '.') }}</td>
        </tr>
        @endif
    </table>

    <div class="divider"></div>

    <div class="footer">
        <p>Terima kasih atas kunjungan Anda!</p>
        <p>Sampai jumpa kembali</p>
    </div>
</body>
</html>
