# CLAUDE.md

# Modern Restaurant POS

## Claude Code Instructions

Version: 1.0

---

# IMPORTANT

Sebelum menulis kode apa pun.

WAJIB membaca seluruh file pada folder docs.

Urutan membaca:

1. PROJECT_SCOPE.md
2. DATABASE.md
3. UI_UX.md
4. ROADMAP.md
5. CLAUDE.md

Jangan mulai implementasi sebelum seluruh dokumen dibaca.

---

# PROJECT SUMMARY

Aplikasi POS Restoran Modern.

Role:

* Owner
* Kasir

Owner fokus monitoring bisnis.

Kasir fokus transaksi.

---

# MAIN OBJECTIVE

Bangun aplikasi yang siap digunakan pada lingkungan produksi.

Bukan prototype.

Bukan demo.

Bukan CRUD sederhana.

Tampilan harus terasa seperti software POS komersial modern.

---

# TECHNOLOGY STACK

Backend

Laravel 13

PHP 8.4+

---

Frontend

React

Inertia.js

TypeScript

---

UI

Tailwind CSS v4

Shadcn UI

---

Database

MySQL 8+

---

Testing

Pest

---

Version Control

Git

GitHub

---

# UI REQUIREMENTS

Jangan menggunakan:

* AdminLTE
* Bootstrap Admin Template
* Dashboard Jadul
* CRUD Default Laravel

---

Gunakan inspirasi:

* Toast POS
* Square POS
* Shopify POS
* Stripe Dashboard

---

Tampilan harus:

* Modern
* Premium
* Minimalis
* Cepat
* Mobile Friendly

---

# ROLE REQUIREMENTS

## Owner

Dashboard

Menu

Pengeluaran

Laporan

Profil

---

## Kasir

POS

Riwayat Transaksi

Pengeluaran

Profil

---

Kasir tidak boleh melihat:

* Omzet Keseluruhan
* HPP Keseluruhan
* Laba Bersih
* Laporan Owner

---

# REDIRECT RULES

Owner Login

↓

Dashboard Owner

---

Kasir Login

↓

POS

---

Jangan arahkan kasir ke dashboard owner.

---

# DATABASE RULES

Gunakan:

Laravel Migration

Laravel Seeder

Eloquent ORM

---

Dilarang:

SQL Manual

---

Seluruh struktur database harus berasal dari DATABASE.md.

---

# BUSINESS LOGIC RULES

Gunakan:

Controller

↓

Service

↓

Repository

↓

Model

---

Jangan menaruh business logic dalam controller.

---

# CHECKOUT RULES

Saat checkout.

Gunakan Database Transaction.

Flow:

Create Transaction

↓

Create Transaction Items

↓

Commit

---

Jika gagal.

Rollback.

---

# INVOICE RULES

Format:

INV-YYYYMMDD-XXXX

Contoh:

INV-20260604-0001

---

Invoice harus unik.

---

# CALCULATION RULES

Omzet

=

Total Penjualan

---

HPP

=

Qty × HPP Menu

---

Laba Bersih

=

Omzet

*

HPP

*

Pengeluaran

---

Perhitungan wajib dilakukan otomatis.

---

# SECURITY RULES

Gunakan:

Authentication

Authorization

Validation

CSRF Protection

Password Hashing

---

Kasir tidak boleh mengakses halaman owner.

---

# PERFORMANCE RULES

Gunakan:

Pagination

Caching

Lazy Loading

Eager Loading

---

Dashboard harus cepat.

---

# IMAGE RULES

Upload foto menu menggunakan:

Laravel Storage

---

Validasi:

jpg

jpeg

png

webp

---

Max Size:

5MB

---

# TESTING RULES

Wajib membuat test untuk:

Authentication

Menu

POS

Expense

Report

Profile

---

Jangan menandai task selesai jika test gagal.

---

# GIT RULES

Gunakan Conventional Commit.

---

Contoh:

feat(auth): add login system

feat(menu): menu management

feat(pos): transaction module

feat(expense): expense module

feat(report): reporting dashboard

---

# GITHUB RULES

Setelah setiap phase selesai:

git add .

git commit

git push

---

# DEVELOPMENT PROCESS

Untuk setiap phase:

1. Analisa kebutuhan.
2. Buat plan implementasi.
3. Buat migration jika diperlukan.
4. Buat model.
5. Buat service.
6. Buat UI.
7. Buat testing.
8. Jalankan testing.
9. Commit.
10. Push.

---

# OUT OF SCOPE

Jangan membuat fitur berikut:

* Multi Cabang
* Membership
* Loyalty Point
* Supplier
* Purchase Order
* Inventory Kompleks
* Kitchen Display
* Online Order
* WhatsApp Integration

Fitur di atas tidak termasuk versi saat ini.

---

# CODE QUALITY

Gunakan:

* SOLID
* DRY
* KISS
* Clean Code

---

Hindari:

* Duplicate Code
* Hardcoded Value
* Dead Code
* Unused Import

---

# FINAL GOAL

Hasil akhir harus berupa aplikasi POS restoran modern dengan kualitas production-ready.

Kasir dapat melakukan transaksi dengan cepat.

Owner dapat memantau omzet, HPP, pengeluaran, dan laba bersih secara realtime.

UI harus terlihat profesional dan setara software POS komersial modern.
