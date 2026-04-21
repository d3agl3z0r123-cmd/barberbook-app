<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOwnedBarbershopIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $barbershop = $request->user()?->barbershop;

        if ($barbershop && ! $barbershop->is_active) {
            return response()->json([
                'message' => 'Esta barbearia está desativada. Contacta o suporte BarberBook.',
            ], 403);
        }

        return $next($request);
    }
}
