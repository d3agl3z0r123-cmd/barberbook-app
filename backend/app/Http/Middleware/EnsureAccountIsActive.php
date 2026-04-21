<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_active) {
            return response()->json([
                'message' => 'Esta conta está desativada. Contacta o suporte BarberBook.',
            ], 403);
        }

        return $next($request);
    }
}
