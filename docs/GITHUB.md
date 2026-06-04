# GITHUB.md

# Modern Restaurant POS

## GitHub Workflow & Version Control Rules

Version: 1.0

---

# PURPOSE

Dokumen ini mendefinisikan standar Git dan GitHub yang wajib digunakan selama pengembangan.

Seluruh perubahan kode harus menggunakan Git.

Seluruh progress harus tersimpan di GitHub.

---

# REPOSITORY

Repository harus dibuat di GitHub.

Nama repository:

modern-restaurant-pos

atau

restaurant-pos

atau sesuai nama bisnis.

---

# INITIAL SETUP

Setelah project dibuat:

Initialize Git.

Hubungkan ke GitHub Repository.

Pastikan branch utama tersedia.

---

# BRANCH STRATEGY

Gunakan struktur berikut.

---

main

Production Ready Branch

---

develop

Development Branch

---

feature/*

Untuk fitur baru.

Contoh:

feature/authentication

feature/menu-management

feature/pos-system

feature/expense-module

feature/report-module

---

bugfix/*

Untuk perbaikan bug.

Contoh:

bugfix/login-error

bugfix/receipt-layout

---

hotfix/*

Untuk perbaikan kritis pada production.

---

# WORKFLOW

Developer bekerja di:

feature/*

↓

Testing

↓

Merge ke develop

↓

Testing

↓

Merge ke main

---

# COMMIT RULES

Gunakan Conventional Commit.

---

# Feature

feat

Contoh:

feat(auth): implement login system

feat(menu): add menu management

feat(pos): implement checkout flow

feat(expense): create expense module

feat(report): add profit report

---

# Fix

fix

Contoh:

fix(pos): correct payment calculation

fix(report): correct profit formula

---

# Refactor

refactor

Contoh:

refactor(menu): optimize menu service

---

# Documentation

docs

Contoh:

docs(readme): update installation guide

---

# Test

test

Contoh:

test(pos): add checkout test

---

# Chore

chore

Contoh:

chore(deps): update dependencies

---

# COMMIT FREQUENCY

Commit setiap fitur selesai.

Jangan menunggu banyak perubahan.

---

GOOD

1 fitur

↓

1 commit

---

BAD

20 fitur

↓

1 commit

---

# REQUIRED COMMITS

Minimal commit:

Project Setup

Database

Authentication

Dashboard

Menu

POS

Expenses

Reports

Profile

Testing

Deployment

---

# README REQUIREMENT

README.md wajib dibuat.

Isi:

Project Description

Installation

Requirements

Setup Guide

Environment Setup

Run Project

Testing

Deployment

---

# RELEASE VERSIONING

Gunakan Semantic Versioning.

---

Format

MAJOR.MINOR.PATCH

---

Contoh

v1.0.0

Initial Release

---

v1.1.0

New Features

---

v1.1.1

Bug Fix

---

# PULL REQUEST RULES

Setiap fitur besar:

Buat Pull Request.

---

PR wajib berisi:

Summary

Changed Files

Testing Result

Screenshot

---

# ISSUE MANAGEMENT

Gunakan GitHub Issues.

---

Label:

feature

bug

enhancement

documentation

security

---

# PROJECT BOARD

Gunakan GitHub Project.

---

Status:

Backlog

To Do

In Progress

Testing

Done

---

# PROGRESS TRACKING

Setiap phase roadmap harus diupdate.

---

Contoh

Phase 1

Project Setup

Status:

Completed

---

Phase 2

Database

Status:

Completed

---

# GITHUB ACTIONS

Gunakan GitHub Actions.

---

Saat Push:

Run Test

Run Lint

Build Project

---

Jika test gagal.

Jangan merge.

---

# PROTECTED BRANCH

Branch main wajib diproteksi.

---

Tidak boleh:

Direct Push

---

Harus melalui:

Pull Request

Review

Testing

---

# TAGGING

Setiap release wajib membuat tag.

---

Contoh

v1.0.0

v1.1.0

v1.2.0

---

# BACKUP STRATEGY

GitHub menjadi backup utama source code.

---

Jangan menyimpan source code hanya di komputer lokal.

---

# SECURITY RULES

Jangan commit:

.env

API Key

Password

Database Credentials

Secret Key

---

Pastikan .gitignore benar.

---

# RELEASE CHECKLIST

Sebelum release.

Pastikan:

✓ Semua fitur selesai

✓ Semua test berhasil

✓ Tidak ada error console

✓ Tidak ada debug mode

✓ README diperbarui

✓ Version ditingkatkan

✓ Tag dibuat

---

# DEPLOYMENT BRANCH

Branch:

main

adalah branch yang digunakan untuk deployment.

---

# FINAL OBJECTIVE

Seluruh pengembangan harus:

* Terstruktur
* Mudah dilacak
* Aman
* Siap produksi

GitHub menjadi sumber kebenaran utama untuk seluruh source code aplikasi Modern Restaurant POS.
