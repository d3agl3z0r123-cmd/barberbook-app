<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\AppointmentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Barbershop;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless($request->user()?->role?->isPlatformAdmin(), 403);

        return response()->json([
            'metrics' => [
                'users' => User::query()->count(),
                'owners' => User::query()->where('role', UserRole::Owner->value)->count(),
                'clients' => User::query()->where('role', UserRole::Client->value)->count(),
                'barbershops' => Barbershop::query()->count(),
                'appointments_confirmed' => Appointment::query()->where('status', AppointmentStatus::Confirmed->value)->count(),
                'monthly_revenue' => Appointment::query()
                    ->whereMonth('starts_at', now('UTC')->month)
                    ->where('status', AppointmentStatus::Completed->value)
                    ->join('services', 'appointments.service_id', '=', 'services.id')
                    ->sum('services.price'),
                'active_subscriptions' => Subscription::query()->whereIn('status', ['trialing', 'active'])->count(),
            ],
        ]);
    }
}
