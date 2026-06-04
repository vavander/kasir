# DATABASE.md

# Modern Restaurant POS

## Database Specification

Version: 1.0

Framework:
Laravel 13

Database:
MySQL 8+

ORM:
Eloquent ORM

Migration:
Laravel Migration Only

Seeder:
Laravel Seeder

---

# DATABASE PRINCIPLES

Seluruh database wajib dibuat menggunakan:

* Laravel Migration
* Laravel Seeder
* Eloquent ORM

Dilarang menggunakan SQL manual.

---

# TABLES

## users

Digunakan untuk Owner dan Kasir.

### Fields

id

name

email

password

role

status

last_login_at

created_at

updated_at

---

### Description

role:

* owner
* cashier

status:

* active
* inactive

---

### Rules

email harus unik.

password wajib menggunakan Hash Laravel.

user inactive tidak boleh login.

---

### Relationship

User hasMany Transactions

User hasMany Expenses

---

# menus

Master menu restoran.

### Fields

id

name

hpp

selling_price

image

is_active

created_at

updated_at

---

### Description

hpp:

Harga Pokok Penjualan per menu.

selling_price:

Harga jual menu.

---

### Rules

hpp >= 0

selling_price >= 0

name wajib unik.

---

### Relationship

Menu hasMany TransactionItems

---

# transactions

Header transaksi.

### Fields

id

invoice_number

cashier_id

payment_method

subtotal

total

created_at

updated_at

---

### Description

cashier_id:

User yang melakukan transaksi.

payment_method:

* cash
* qris
* transfer

---

### Rules

invoice_number wajib unik.

---

### Relationship

Transaction belongsTo User

Transaction hasMany TransactionItems

---

# transaction_items

Detail item transaksi.

### Fields

id

transaction_id

menu_id

menu_name

qty

hpp

selling_price

subtotal

created_at

updated_at

---

### Description

menu_name disimpan untuk histori.

hpp disimpan saat transaksi terjadi.

selling_price disimpan saat transaksi terjadi.

---

### Formula

subtotal

=

qty × selling_price

---

### Relationship

TransactionItem belongsTo Transaction

TransactionItem belongsTo Menu

---

# expenses

Data pengeluaran.

### Fields

id

user_id

category

amount

description

expense_date

created_at

updated_at

---

### Categories

Bahan Baku

Gas

Listrik

Transport

Lainnya

---

### Rules

amount harus lebih dari 0.

description opsional.

---

### Relationship

Expense belongsTo User

---

# settings

Data toko.

Hanya satu record.

### Fields

id

store_name

logo

address

phone

created_at

updated_at

---

### Description

Digunakan untuk:

* Nama toko
* Logo
* Informasi struk

---

# RELATIONSHIP

User

hasMany Transactions

hasMany Expenses

---

Transaction

belongsTo User

hasMany TransactionItems

---

TransactionItem

belongsTo Transaction

belongsTo Menu

---

Menu

hasMany TransactionItems

---

Expense

belongsTo User

---

# SEEDERS

## OwnerSeeder

Default Owner

Nama:
Owner

Email:
[owner@example.com](mailto:owner@example.com)

Password:
password

Role:
owner

Status:
active

---

## SettingsSeeder

Store Name:
My Restaurant

Address:
Indonesia

## Phone:

---

# INVOICE FORMAT

Format:

INV-YYYYMMDD-XXXX

Contoh:

INV-20260604-0001

INV-20260604-0002

INV-20260604-0003

---

Invoice harus unik.

---

# DASHBOARD CALCULATION

## Omzet

Omzet

=

SUM(transactions.total)

---

## HPP

HPP

=

SUM(
transaction_items.hpp
×
transaction_items.qty
)

---

## Pengeluaran

Pengeluaran

=

SUM(expenses.amount)

---

## Laba Bersih

Laba Bersih

=

Omzet

*

HPP

*

Pengeluaran

---

# EXAMPLE

Menu:

Nasi Goreng

HPP:
10000

Harga Jual:
18000

---

Terjual:

10 Porsi

---

Omzet

=

18000 × 10

=

180000

---

HPP

=

10000 × 10

=

100000

---

Pengeluaran

=

20000

---

Laba Bersih

=

180000

*

100000

*

20000

=

60000

---

# INDEXING

Tambahkan index pada:

users.email

menus.name

transactions.invoice_number

transactions.created_at

expenses.expense_date

---

# PERFORMANCE

Target:

* 5.000 Menu
* 100.000 Transaksi
* 20 Kasir

Dashboard harus tetap cepat.

---

# DATA RULES

Transaksi tidak boleh dihapus.

Transaction Items tidak boleh dihapus.

Owner dapat menghapus menu yang tidak digunakan.

Pengeluaran dapat diedit oleh pembuatnya.

Kasir hanya dapat melihat transaksi miliknya sendiri.

Owner dapat melihat seluruh transaksi.

---

# DATABASE TRANSACTION

Saat Checkout:

BEGIN TRANSACTION

↓

Simpan Transaction

↓

Simpan Transaction Items

↓

COMMIT

Jika gagal:

ROLLBACK

---

# FINAL GOAL

Database harus sederhana.

Mudah dipelihara.

Mudah dikembangkan.

Mendukung kebutuhan restoran dan UMKM tanpa kompleksitas yang tidak diperlukan.
