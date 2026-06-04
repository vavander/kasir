# PROJECT_SCOPE.md

# Modern Restaurant POS

## Overview

Aplikasi POS berbasis web untuk restoran, warung makan, kafe, dan UMKM kuliner.

Sistem memiliki 2 role:

* Owner
* Kasir

Tujuan utama:

* Mencatat transaksi penjualan
* Mengelola menu
* Mencatat pengeluaran
* Menghitung omzet
* Menghitung HPP
* Menghitung laba bersih

---

# ROLE

## Owner

Owner dapat:

* Login
* Melihat Dashboard
* Mengelola Menu
* Menginput Pengeluaran
* Melihat Laporan
* Mengubah Profil

Owner tidak melakukan transaksi kasir.

---

## Kasir

Kasir dapat:

* Login
* Melakukan Transaksi
* Melihat Riwayat Transaksi Sendiri
* Menginput Pengeluaran
* Mengubah Profil

Kasir tidak dapat melihat laporan keuntungan.

---

# DASHBOARD OWNER

Menampilkan:

## Omzet Hari Ini

Total seluruh penjualan.

---

## HPP Hari Ini

Total harga pokok menu yang terjual.

---

## Pengeluaran Hari Ini

Total pengeluaran operasional.

---

## Laba Bersih Hari Ini

Rumus:

Omzet

*

HPP

*

Pengeluaran

---

## Grafik

Penjualan 7 Hari Terakhir.

---

## Menu Terlaris

5 menu paling banyak terjual.

---

# MENU MANAGEMENT

Owner dapat:

* Tambah Menu
* Edit Menu
* Hapus Menu

Data Menu:

* Nama Menu
* HPP
* Harga Jual
* Foto
* Status Aktif

---

# POS

Kasir langsung masuk halaman POS setelah login.

---

## Tampilan

Kiri:

Daftar Menu

Kanan:

Keranjang

---

## Fitur

Cari Menu

Tambah Menu ke Keranjang

Ubah Qty

Hapus Item

Checkout

Cetak Struk

---

## Pembayaran

Cash

QRIS

Transfer

---

# PENGELUARAN

Owner dan Kasir dapat mencatat pengeluaran.

Data:

* Tanggal
* Kategori
* Nominal
* Keterangan

Kategori:

* Bahan Baku
* Gas
* Listrik
* Transport
* Lainnya

---

# RIWAYAT TRANSAKSI

Kasir hanya melihat transaksi miliknya.

Data:

* Invoice
* Tanggal
* Total
* Metode Pembayaran

---

# LAPORAN

Owner dapat melihat:

## Penjualan

Harian

Bulanan

---

## Pengeluaran

Harian

Bulanan

---

## Laba Bersih

Harian

Bulanan

---

# PERHITUNGAN

Omzet

=

Total Penjualan

---

HPP

=

Jumlah Terjual × HPP Menu

---

Laba Bersih

=

Omzet

*

HPP

*

Pengeluaran

---

# UI DESIGN

Inspirasi:

* Toast POS
* Square POS
* Shopify

Tampilan:

* Modern
* Minimalis
* Premium
* Mobile Friendly

---

# TECHNOLOGY

Backend

* Laravel 13

Frontend

* React
* Inertia.js
* TypeScript

UI

* Tailwind CSS v4
* Shadcn UI

Database

* MySQL

---

# DATABASE

users

menus

transactions

transaction_items

expenses

settings

---

# SUCCESS CRITERIA

Kasir dapat menyelesaikan transaksi kurang dari 30 detik.

Owner dapat melihat omzet dan laba secara realtime.

Sistem mudah digunakan tanpa pelatihan khusus.

Tampilan setara aplikasi POS restoran modern.
