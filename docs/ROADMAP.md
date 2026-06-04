# ROADMAP.md

# Modern Restaurant POS

## Development Roadmap

Version: 1.0

---

# PROJECT OBJECTIVE

Membangun aplikasi POS restoran modern berbasis web.

Target pengguna:

* Owner
* Kasir

Fokus utama:

* Transaksi Penjualan
* Pengelolaan Menu
* Pengeluaran
* Dashboard Omzet
* Dashboard HPP
* Dashboard Laba Bersih

---

# TECHNOLOGY STACK

Backend

* Laravel 13
* PHP 8.4+

Frontend

* React
* Inertia.js
* TypeScript

UI

* Tailwind CSS v4
* Shadcn UI

Database

* MySQL 8+

Authentication

* Laravel Breeze

Testing

* Pest

Version Control

* Git
* GitHub

---

# DEVELOPMENT RULES

Claude wajib:

1. Membaca seluruh folder docs.
2. Membuat migration terlebih dahulu.
3. Membuat model dan relationship.
4. Membuat seeder.
5. Membuat UI sesuai UI_UX.md.
6. Membuat testing.
7. Commit setiap phase.
8. Push ke GitHub setiap phase selesai.

---

# PHASE 1

PROJECT SETUP

---

## Tasks

Install Laravel 13

Setup React

Setup Inertia.js

Setup TypeScript

Setup Tailwind CSS

Setup Shadcn UI

Setup Laravel Breeze

Setup Pest

Setup Git

Setup GitHub Repository

---

## Deliverables

Project berhasil dijalankan.

Login page tersedia.

GitHub repository terhubung.

---

# PHASE 2

DATABASE FOUNDATION

---

## Tasks

Buat Migration

Buat Model

Buat Relationship

Buat Seeder

---

## Tables

users

menus

transactions

transaction_items

expenses

settings

---

## Deliverables

Migration berhasil dijalankan.

Seeder berhasil dijalankan.

Database siap digunakan.

---

# PHASE 3

AUTHENTICATION

---

## Features

Login

Logout

Remember Me

Role Redirect

---

## Rules

Owner login

↓

Dashboard Owner

---

Kasir login

↓

POS

---

## Deliverables

Owner dan Kasir dapat login.

Role berjalan normal.

---

# PHASE 4

OWNER DASHBOARD

---

## Features

Omzet Hari Ini

HPP Hari Ini

Pengeluaran Hari Ini

Laba Bersih Hari Ini

Grafik Penjualan

Grafik Pengeluaran

Menu Terlaris

---

## Deliverables

Dashboard owner selesai.

Semua data realtime.

---

# PHASE 5

MENU MANAGEMENT

---

## Features

Tambah Menu

Edit Menu

Hapus Menu

Cari Menu

Upload Foto

---

## Deliverables

Owner dapat mengelola menu.

---

# PHASE 6

POS SYSTEM

---

## Features

Cari Menu

Grid Menu

Keranjang

Checkout

Pembayaran

Struk

---

## Payment Method

Cash

QRIS

Transfer

---

## Deliverables

Kasir dapat melakukan transaksi.

Struk dapat dicetak.

---

# PHASE 7

TRANSACTION HISTORY

---

## Features

Daftar Transaksi

Detail Transaksi

Cari Invoice

Print Ulang Struk

---

## Deliverables

Kasir dapat melihat transaksi miliknya.

Owner dapat melihat seluruh transaksi.

---

# PHASE 8

EXPENSE MANAGEMENT

---

## Features

Tambah Pengeluaran

Edit Pengeluaran

Riwayat Pengeluaran

Filter Pengeluaran

---

## Categories

Bahan Baku

Gas

Listrik

Transport

Lainnya

---

## Deliverables

Owner dan Kasir dapat mencatat pengeluaran.

---

# PHASE 9

REPORT MODULE

---

## Features

Laporan Penjualan

Laporan Pengeluaran

Laporan Laba Bersih

---

## Filters

Harian

Bulanan

Custom Range

---

## Export

PDF

Excel

---

## Deliverables

Owner dapat melihat laporan bisnis.

---

# PHASE 10

PROFILE SETTINGS

---

## Features

Edit Profil

Ganti Password

Upload Foto Profil

---

## Deliverables

Owner dan Kasir dapat mengelola akun sendiri.

---

# PHASE 11

UI POLISH

---

## Tasks

Dark Mode

Skeleton Loading

Toast Notification

Responsive Layout

Empty State

Error State

---

## Deliverables

Tampilan premium dan modern.

---

# PHASE 12

TESTING

---

## Tests

Authentication Test

Menu Test

POS Test

Expense Test

Report Test

Profile Test

---

## Deliverables

Semua test berhasil.

---

# PHASE 13

OPTIMIZATION

---

## Tasks

Query Optimization

Caching Dashboard

Pagination

Image Optimization

Code Cleanup

---

## Deliverables

Aplikasi cepat dan stabil.

---

# PHASE 14

GITHUB WORKFLOW

---

## Commit Format

feat(auth): authentication system

feat(menu): menu management

feat(pos): cashier pos

feat(expense): expense management

feat(report): reporting module

fix(ui): responsive improvement

---

## Rules

Commit setiap phase selesai.

Push setiap phase selesai.

Update README setiap phase selesai.

---

# PHASE 15

DEPLOYMENT READY

---

## Tasks

Environment Setup

Production Config

Build Assets

Optimize Laravel

Storage Setup

---

## Deliverables

Project siap deploy ke VPS atau Hosting.

---

# DEFINITION OF DONE

Sebuah phase dianggap selesai jika:

✓ Feature selesai

✓ UI selesai

✓ Validation selesai

✓ Testing selesai

✓ Commit selesai

✓ Push ke GitHub selesai

---

# FINAL TARGET

Aplikasi POS restoran modern yang:

* Mudah digunakan kasir
* Mudah dipantau owner
* Menghitung omzet otomatis
* Menghitung HPP otomatis
* Menghitung laba bersih otomatis
* Mobile friendly
* Production ready
* Siap digunakan untuk operasional harian restoran atau UMKM kuliner
