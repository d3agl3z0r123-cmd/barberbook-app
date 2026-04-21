<?php

namespace App\Http\Controllers\Api\Client;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StorePublicAppointmentRequest;
use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Barbershop;
use App\Services\AppointmentConflictService;
use App\Services\AppointmentNotificationService;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PublicAppointmentController extends Controller
{
    private const FIXED_SLOTS = [
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '18:30',
    ];

    private const MINIMUM_BOOKING_BUFFER_MINUTES = 30;

    public function __construct(
        private readonly AppointmentConflictService $conflicts,
        private readonly AppointmentNotificationService $notifications,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'barber_id' => ['required', 'integer', 'exists:barbers,id'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $barber = Barber::query()->with('barbershop')->findOrFail($payload['barber_id']);
        $barbershop = $barber->barbershop;

        abort_if(! $barbershop?->is_active || ! $barbershop->user?->is_active, 404);

        $day = CarbonImmutable::createFromFormat('Y-m-d', $payload['date'], $barbershop->timezone)->startOfDay();
        $startsAtUtc = $day->utc();
        $endsAtUtc = $day->endOfDay()->utc();

        $appointments = Appointment::query()
            ->where('barber_id', $barber->id)
            ->whereBetween('starts_at', [$startsAtUtc, $endsAtUtc])
            ->whereIn('status', [
                AppointmentStatus::Booked->value,
                AppointmentStatus::Pending->value,
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::Completed->value,
            ])
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Appointment $appointment) => [
                'id' => $appointment->id,
                'starts_at' => $appointment->starts_at?->copy()->timezone($barbershop->timezone)->toIso8601String(),
                'ends_at' => $appointment->ends_at?->copy()->timezone($barbershop->timezone)->toIso8601String(),
                'status' => $appointment->status instanceof \BackedEnum ? $appointment->status->value : $appointment->status,
                'slot' => $appointment->starts_at?->copy()->timezone($barbershop->timezone)->format('H:i'),
            ]);

        return response()->json([
            'barber_id' => $barber->id,
            'date' => $payload['date'],
            'timezone' => $barbershop->timezone,
            'appointments' => $appointments,
        ]);
    }

    public function store(StorePublicAppointmentRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $barbershop = Barbershop::query()
            ->where('slug', $payload['slug'])
            ->where('is_active', true)
            ->whereHas('user', fn ($query) => $query->where('is_active', true))
            ->firstOrFail();

        $barber = $barbershop->barbers()
            ->where('is_active', true)
            ->findOrFail($payload['barber_id']);

        $service = $barbershop->services()
            ->where('is_active', true)
            ->findOrFail($payload['service_id']);

        $startsAtLocal = CarbonImmutable::parse($payload['starts_at'], $barbershop->timezone);
        $this->ensureAllowedSlot($startsAtLocal->format('H:i'));
        $this->ensureBookableTime($startsAtLocal, $barbershop->timezone);

        $startsAtUtc = $startsAtLocal->utc();
        $endsAtUtc = $startsAtUtc->addMinutes(30);

        try {
            $appointment = DB::transaction(function () use ($barbershop, $barber, $service, $payload, $startsAtUtc, $endsAtUtc) {
                $existingAppointment = Appointment::query()
                    ->where('barber_id', $barber->id)
                    ->where('starts_at', $startsAtUtc)
                    ->lockForUpdate()
                    ->first();

                if ($existingAppointment) {
                    $this->throwSlotUnavailable();
                }

                if ($this->conflicts->hasConflict($barber->id, $startsAtUtc, $endsAtUtc)) {
                    $this->throwSlotUnavailable();
                }

                return Appointment::query()->create([
                    'barbershop_id' => $barbershop->id,
                    'barber_id' => $barber->id,
                    'service_id' => $service->id,
                    'client_name' => $payload['client_name'],
                    'client_phone' => $payload['client_phone'],
                    'client_email' => $payload['client_email'] ?? null,
                    'starts_at' => $startsAtUtc,
                    'ends_at' => $endsAtUtc,
                    'notes' => $payload['notes'] ?? null,
                    'status' => AppointmentStatus::Booked,
                    'source' => 'public_booking',
                ]);
            }, 3);
        } catch (QueryException $exception) {
            if ($this->isDuplicateSlotException($exception)) {
                $this->throwSlotUnavailable();
            }

            throw $exception;
        }

        $this->notifications->dispatchConfirmation($appointment);

        return response()->json([
            'message' => 'Agendamento confirmado com sucesso.',
            'appointment' => [
                'id' => $appointment->id,
                'barbershop' => [
                    'id' => $barbershop->id,
                    'name' => $barbershop->name,
                    'slug' => $barbershop->slug,
                    'timezone' => $barbershop->timezone,
                ],
                'barber' => [
                    'id' => $barber->id,
                    'name' => $barber->name,
                ],
                'service' => [
                    'id' => $service->id,
                    'name' => $service->name,
                ],
                'client_name' => $appointment->client_name,
                'client_phone' => $appointment->client_phone,
                'client_email' => $appointment->client_email,
                'starts_at' => $appointment->starts_at?->copy()->timezone($barbershop->timezone)->toIso8601String(),
                'ends_at' => $appointment->ends_at?->copy()->timezone($barbershop->timezone)->toIso8601String(),
                'status' => $appointment->status instanceof \BackedEnum ? $appointment->status->value : $appointment->status,
            ],
        ], 201);
    }

    private function ensureAllowedSlot(string $time): void
    {
        if (in_array($time, self::FIXED_SLOTS, true)) {
            return;
        }

        throw ValidationException::withMessages([
            'time' => ['O horário selecionado não pertence aos slots fixos disponíveis.'],
        ]);
    }

    private function ensureBookableTime(CarbonImmutable $startsAtLocal, string $timezone): void
    {
        $minimumStart = now($timezone)
            ->addMinutes(self::MINIMUM_BOOKING_BUFFER_MINUTES)
            ->startOfMinute();

        if ($startsAtLocal->greaterThanOrEqualTo($minimumStart)) {
            return;
        }

        throw ValidationException::withMessages([
            'time' => ['Este horário já passou ou não respeita a antecedência mínima de 30 minutos.'],
        ]);
    }

    private function throwSlotUnavailable(): never
    {
        throw ValidationException::withMessages([
            'time' => ['Este horário já não está disponível'],
        ]);
    }

    private function isDuplicateSlotException(QueryException $exception): bool
    {
        $message = strtolower($exception->getMessage());

        return str_contains($message, 'appointments_barber_start_unique')
            || str_contains($message, 'unique constraint')
            || str_contains($message, 'duplicate entry');
    }
}
