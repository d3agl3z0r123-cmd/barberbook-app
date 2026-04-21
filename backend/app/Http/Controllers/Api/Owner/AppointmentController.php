<?php

namespace App\Http\Controllers\Api\Owner;

use App\Enums\AppointmentStatus;
use App\Exceptions\SchedulingConflictException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreAppointmentRequest;
use App\Http\Resources\Owner\AppointmentResource;
use App\Models\Appointment;
use App\Models\Barbershop;
use App\Models\Service;
use App\Services\AppointmentConflictService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(private readonly AppointmentConflictService $conflicts)
    {
    }

    public function index(Request $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);

        $appointments = Appointment::query()
            ->where('barbershop_id', $barbershop->id)
            ->with(['barbershop', 'client', 'barber', 'service'])
            ->latest('starts_at')
            ->páginate();

        return response()->json(AppointmentResource::collection($appointments));
    }

    public function store(StoreAppointmentRequest $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);

        $payload = $request->validated();
        $service = Service::query()->where('barbershop_id', $barbershop->id)->findOrFail($payload['service_id']);
        $startsAtUtc = CarbonImmutable::parse($payload['starts_at_local'], $barbershop->timezone)->utc();
        $endsAtUtc = $startsAtUtc->addMinutes($service->duration_minutes);

        if ($this->conflicts->hasConflict($payload['barber_id'], $startsAtUtc, $endsAtUtc)) {
            throw new SchedulingConflictException('Já existe uma marcação neste intervalo.');
        }

        $appointment = Appointment::query()->create([
            'barbershop_id' => $barbershop->id,
            'client_id' => $payload['client_id'],
            'barber_id' => $payload['barber_id'],
            'service_id' => $payload['service_id'],
            'starts_at' => $startsAtUtc,
            'ends_at' => $endsAtUtc,
            'status' => AppointmentStatus::Confirmed,
            'source' => 'dashboard',
            'notes' => $payload['notes'] ?? null,
        ]);

        return response()->json(new AppointmentResource($appointment->load(['barbershop', 'client', 'barber', 'service'])), 201);
    }

    public function cancel(Request $request, Barbershop $barbershop, Appointment $appointment): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);
        abort_unless($appointment->barbershop_id === $barbershop->id, 404);

        $appointment->update(['status' => AppointmentStatus::Cancelled]);

        return response()->json(new AppointmentResource($appointment->fresh()->load(['barbershop', 'client', 'barber', 'service'])));
    }

    private function authorizeOwner(Request $request, Barbershop $barbershop): void
    {
        abort_unless(
            $request->user()?->ownedBarbershops()->whereKey($barbershop->id)->exists()
            || $request->user()?->memberships()->whereKey($barbershop->id)->wherePivot('role', 'owner')->exists(),
            403
        );
    }
}
