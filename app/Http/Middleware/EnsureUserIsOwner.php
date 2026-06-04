<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isOwner()) {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengakses halaman ini.');
        }

        return $next($request);
    }
}
