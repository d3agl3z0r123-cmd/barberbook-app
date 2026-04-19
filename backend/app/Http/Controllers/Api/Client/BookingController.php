<?php

namespace App\Http\Controllers\Api\Client;

use App\Enums\AppointmentStatus;
use App\Exceptions\SchedulingConflictException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreBookingRequest;
use App\Http\Resources\Owner\AppointmentResource;
use App\Models\Appointment;
use App\Models\Barbershop;
use App\Models\Client;
use App\Models\Service;
use App\Services\AppointmentConflictService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private readonly AppointmentConflictService $conflicts)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $appointments = Appointment::query()
            ->whereHas('client', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with(['barbershop', 'client', 'barber', 'service'])
            ->latest('starts_at')
            ->paginate();

        return response()->json(AppointmentResource::collection($appointments));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $barbershop = Barbershop::query()->findOrFail($payload['barbershop_id']);
        $service = Service::query()->where('barbershop_id', $barbershop->id)->findOrFail($payload['service_id']);
        $client = Client::query()->firstOrCreate(
            ['barbershop_id' => $barbershop->id, 'user_id' => $request->user()->id],
            ['name' => $request->user()->name, 'email' => $request->user()->email, 'phone' => $request->user()->phone]
        );

        $startsAtUtc = CarbonImmutable::parse($payload['starts_at_local'], $barbershop->timezone)->utc();
        $endsAtUtc = $startsAtUtc->addMinutes($service->duration_minutes);

        if ($this->conflicts->hasConflict($payload['barber_id'], $startsAtUtc, $endsAtUtc)) {
            throw new SchedulingConflictException('O slot selecionado ja nao esta disponivel.');
        }

        $appointment = Appointment::query()->create([
            'barbershop_id' => $barbershop->id,
            'client_id' => $client->id,
            'barber_id' => $payload['barber_id'],
            'service_id' => $payload['service_id'],
            'starts_at' => $startsAtUtc,
            'ends_at' => $endsAtUtc,
            'status' => AppointmentStatus::Pending,
            'source' => 'public_booking',
            'notes' => $payload['notes'] ?? null,
        ]);

        return response()->json(new AppointmentResource($appointment->load(['barbershop', 'client', 'barber', 'service'])), 201);
    }

    public function cancel(Request $request, Appointment $appointment): JsonResponse
    {
        abort_unless($appointment->client?->user_id === $request->user()->id, 404);

        $appointment->update(['status' => AppointmentStatus::Cancelled]);

        return response()->json(new AppointmentResource($appointment->fresh()->load(['barbershop', 'client', 'barber', 'service'])));
    }
}
