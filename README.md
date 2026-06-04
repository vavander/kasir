# Modern Restaurant POS

Aplikasi POS (Point of Sale) berbasis web untuk restoran, warung makan, kafe, dan UMKM kuliner.

## Tech Stack

- **Backend**: Laravel 13, PHP 8.5+
- **Frontend**: React, Inertia.js, TypeScript
- **UI**: Tailwind CSS v4, Shadcn UI
- **Database**: MySQL 8+ / SQLite (testing)
- **Auth**: Laravel Breeze
- **Testing**: Pest 4

## Requirements

- PHP 8.4+
- Composer
- Node.js 18+
- MySQL 8+

## Installation

```bash
git clone https://github.com/vavander/kasir.git
cd kasir
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
npm run build
php artisan serve
```

## Default Credentials

| Role  | Email               | Password |
|-------|---------------------|----------|
| Owner | owner@example.com   | password |

## Testing

```bash
vendor/bin/pest
```

## Development Progress

- [x] Phase 1 - Project Setup
- [x] Phase 2 - Database Foundation
- [ ] Phase 3 - Authentication
- [ ] Phase 4 - Owner Dashboard
- [ ] Phase 5 - Menu Management
- [ ] Phase 6 - POS System
