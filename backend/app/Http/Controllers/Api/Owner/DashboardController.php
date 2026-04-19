<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Barbershop;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request, Barbershop $barbershop): JsonResponse
    {
        abort_unless(
            $request->user()?->ownedBarbershops()->whereKey($barbershop->id)->exists()
            || $request->user()?->memberships()->whereKey($barbershop->id)->wherePivot('role', 'owner')->exists(),
            403
        );

        return response()->json([
            'barbershop' => $barbershop,
            'metrics' => [
                'clients' => Client::query()->where('barbershop_id', $barbershop->id)->count(),
                'appointments_today' => Appointment::query()
                    ->where('barbershop_id', $barbershop->id)
                    ->whereDate('starts_at', now('UTC')->toDateString())
                    ->count(),
                'appointments_pending' => Appointment::query()
                    ->where('barbershop_id', $barbershop->id)
                    ->where('status', 'pending')
                    ->count(),
            ],
        ]);
    }
}
