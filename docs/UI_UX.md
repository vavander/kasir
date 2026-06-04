# UI_UX.md

# Modern Restaurant POS

## UI & UX Specification

Version: 1.0

---

# DESIGN GOAL

Aplikasi harus terlihat seperti software restoran modern.

Bukan dashboard admin biasa.

Bukan CRUD Laravel standar.

Bukan AdminLTE.

Bukan template Bootstrap lama.

---

# DESIGN REFERENCES

Inspirasi desain:

* Toast POS
* Square POS
* Shopify POS
* Stripe Dashboard
* Linear
* Notion

---

# DESIGN STYLE

Gunakan:

* Modern
* Clean
* Premium
* Minimal
* Fast

---

# COLOR SYSTEM

Primary:

Indigo

Secondary:

Slate

Success:

Emerald

Warning:

Amber

Danger:

Rose

---

# TYPOGRAPHY

Font:

Inter

Fallback:

System Sans

---

# BORDER RADIUS

Gunakan rounded modern.

Jangan kotak kaku.

---

# SHADOW

Gunakan soft shadow.

Jangan shadow berlebihan.

---

# ANIMATION

Gunakan animasi ringan.

Contoh:

* Hover Card
* Fade In
* Slide
* Loading Skeleton

---

# RESPONSIVE

Wajib mendukung:

Desktop

Laptop

Tablet

Mobile

---

# DARK MODE

Wajib tersedia.

Mode:

* Light
* Dark
* System

---

# LOGIN PAGE

Layout modern.

---

## Left Section

Logo Toko

Nama Toko

Tagline

Background Illustration

---

## Right Section

Login Form

Email

Password

Remember Me

Login Button

---

# ROLE REDIRECTION

Owner Login

↓

Dashboard Owner

---

Kasir Login

↓

POS Page

---

Kasir tidak boleh masuk dashboard owner.

---

# OWNER INTERFACE

Owner fokus monitoring bisnis.

---

# OWNER SIDEBAR

Dashboard

Menu

Pengeluaran

Laporan

Profil

Logout

---

# OWNER DASHBOARD

Halaman pertama setelah login.

---

# KPI SECTION

Menampilkan 4 Card Utama

---

Card 1

Omzet Hari Ini

---

Card 2

HPP Hari Ini

---

Card 3

Pengeluaran Hari Ini

---

Card 4

Laba Bersih Hari Ini

---

Tampilkan angka besar.

Mudah dibaca.

---

# CHART SECTION

Menampilkan:

Grafik Penjualan 7 Hari

---

Grafik Pengeluaran 7 Hari

---

# TOP MENU SECTION

Menampilkan:

5 Menu Terlaris

---

Data:

Nama Menu

Jumlah Terjual

Pendapatan

---

# RECENT ACTIVITY

Menampilkan:

Transaksi Terbaru

Pengeluaran Terbaru

---

# MENU MANAGEMENT PAGE

Owner dapat mengelola menu.

---

# HEADER

Judul Halaman

Search

Tambah Menu

---

# TABLE

Kolom:

Foto

Nama Menu

HPP

Harga Jual

Status

Aksi

---

# MENU FORM

Field:

Nama Menu

HPP

Harga Jual

Foto

Status

---

# EXPENSE PAGE

Owner dapat melihat seluruh pengeluaran.

---

# SUMMARY

Total Pengeluaran Hari Ini

Total Pengeluaran Bulan Ini

---

# TABLE

Tanggal

Kategori

Nominal

Dibuat Oleh

Keterangan

---

# REPORT PAGE

Tampilan sederhana.

---

Card:

Omzet

HPP

Pengeluaran

Laba Bersih

---

Filter:

Hari

Minggu

Bulan

Custom Date

---

# CASHIER INTERFACE

Kasir memiliki tampilan berbeda.

---

# CASHIER HOME

Setelah login.

Langsung masuk POS.

---

Tidak masuk dashboard.

---

# POS LAYOUT

Desktop

+--------------------------------------+
| Search Menu                          |
+--------------------------------------+

+-------------------+------------------+
| Menu Grid         | Cart             |
|                   |                  |
|                   |                  |
+-------------------+------------------+

+--------------------------------------+
| Checkout                             |
+--------------------------------------+

---

# MENU GRID

Tampilan card.

Setiap menu:

Foto

Nama

Harga

---

Klik menu

↓

Masuk Keranjang

---

# SEARCH MENU

Realtime.

Tanpa reload.

Harus sangat cepat.

---

# CART PANEL

Tampilkan:

Nama Menu

Qty

Harga

Subtotal

---

# CART ACTION

Tambah Qty

Kurangi Qty

Hapus Item

Clear Cart

---

# TOTAL SECTION

Menampilkan:

Jumlah Item

Subtotal

Grand Total

---

# CHECKOUT BUTTON

Ukuran besar.

Selalu terlihat.

Sticky.

---

# CHECKOUT MODAL

Menampilkan:

Total

Metode Pembayaran

Nominal Bayar

Kembalian

---

# PAYMENT METHOD

Cash

QRIS

Transfer

---

# SUCCESS SCREEN

Setelah transaksi berhasil.

Tampilkan:

Success Message

Invoice Number

Print Receipt

Transaksi Baru

---

# RECEIPT DESIGN

Ukuran:

58 mm

80 mm

PDF

---

Isi:

Logo

Nama Toko

Alamat

Tanggal

Kasir

Invoice

Daftar Menu

Qty

Harga

Subtotal

Total

Pembayaran

Kembalian

Ucapan Terima Kasih

---

# TRANSACTION HISTORY

Kasir dapat melihat riwayat miliknya.

---

Kolom:

Invoice

Tanggal

Total

Pembayaran

---

# CASHIER EXPENSE PAGE

Kasir dapat menginput pengeluaran.

---

Form:

Tanggal

Kategori

Nominal

Keterangan

---

Kategori:

Bahan Baku

Gas

Listrik

Transport

Lainnya

---

# EMPTY STATE

Jika tidak ada data.

Tampilkan ilustrasi modern.

Jangan tampilkan tabel kosong.

---

# LOADING STATE

Gunakan:

Skeleton Loading

Progress Indicator

Loading Spinner

---

# NOTIFICATION

Gunakan Toast Notification.

---

Success

Hijau

---

Error

Merah

---

Warning

Kuning

---

# USER EXPERIENCE TARGET

Kasir dapat melakukan transaksi kurang dari 30 detik.

Pencarian menu kurang dari 1 detik.

Checkout kurang dari 5 detik.

Owner dapat melihat laba hari ini tanpa membuka laporan.

Aplikasi terasa seperti software POS restoran komersial modern.
