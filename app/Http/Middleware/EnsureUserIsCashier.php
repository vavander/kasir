<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCashier
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isCashier()) {
            abort(403, 'Akses ditolak. Hanya Kasir yang dapat mengakses halaman ini.');
        }

        return $next($request);
    }
}
