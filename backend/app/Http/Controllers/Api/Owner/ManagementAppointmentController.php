<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ManageAppointmentRequest;
use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Barbershop;
use App\Models\Service;
use App\Services\AppointmentConflictService;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ManagementAppointmentController extends Controller
{
    public function __construct(private readonly AppointmentConflictService $conflicts)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);

        return response()->json([
            'appointments' => $barbershop->appointments()
                ->with(['barber', 'service'])
                ->latest('starts_at')
                ->get()
                ->map(fn (Appointment $appointment) => $this->formatAppointment($appointment, $barbershop->timezone)),
        ]);
    }

    public function day(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $barbershop = $this->resolveBarbershop($request);
        $timezone = $barbershop->timezone ?: 'Atlantic/Azores';
        $day = isset($payload['date'])
            ? CarbonImmutable::createFromFormat('Y-m-d', $payload['date'], $timezone)->startOfDay()
            : now($timezone)->startOfDay()->toImmutable();
        $dayStartUtc = $day->utc();
        $dayEndUtc = $day->endOfDay()->utc();
        $appointments = $barbershop->appointments()
            ->with(['barber', 'service'])
            ->whereBetween('starts_at', [$dayStartUtc, $dayEndUtc])
            ->orderBy('starts_at')
            ->get();
        $formattedAppointments = $appointments
            ->map(fn (Appointment $appointment) => $this->formatAppointment($appointment, $timezone))
            ->values();
        $summary = [
            'total' => $appointments->count(),
            'booked' => $appointments->filter(fn (Appointment $appointment) => $this->appointmentStatusValue($appointment) === 'booked')->count(),
            'completed' => $appointments->filter(fn (Appointment $appointment) => $this->appointmentStatusValue($appointment) === 'completed')->count(),
            'cancelled' => $appointments->filter(fn (Appointment $appointment) => $this->appointmentStatusValue($appointment) === 'cancelled')->count(),
            'upcoming' => $appointments
                ->filter(fn (Appointment $appointment) => $appointment->starts_at?->isFuture())
                ->count(),
        ];

        return response()->json([
            'date' => $day->format('Y-m-d'),
            'timezone' => $timezone,
            'summary' => $summary,
            'appointments' => $formattedAppointments,
        ]);
    }

    public function store(ManageAppointmentRequest $request): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        [$barber, $service] = $this->resolveOwnedResources($barbershop, $request->integer('barber_id'), $request->integer('service_id'));
        [$startsAtUtc, $endsAtUtc] = $this->resolveSchedule($barbershop, $service, $request->string('starts_at')->toString());

        try {
            $appointment = DB::transaction(function () use ($request, $barbershop, $barber, $service, $startsAtUtc, $endsAtUtc) {
                $this->ensureSlotStillAvailable($barber->id, $startsAtUtc);
                $this->ensureNoConflict($barber->id, $startsAtUtc, $endsAtUtc);

                return $barbershop->appointments()->create([
                    'barber_id' => $barber->id,
                    'service_id' => $service->id,
                    'client_name' => $request->validated('client_name'),
                    'client_phone' => $request->validated('client_phone'),
                    'client_email' => $request->validated('client_email'),
                    'starts_at' => $startsAtUtc,
                    'ends_at' => $endsAtUtc,
                    'notes' => $request->validated('notes'),
                    'status' => $request->validated('status') ?? 'booked',
                    'source' => 'management-test',
                ]);
            }, 3);
        } catch (QueryException $exception) {
            if ($this->isDuplicateSlotException($exception)) {
                $this->throwSlotUnavailable();
            }

            throw $exception;
        }

        return response()->json([
            'message' => 'Agendamento criado com sucesso.',
            'appointment' => $this->formatAppointment($appointment->load(['barber', 'service']), $barbershop->timezone),
        ], 201);
    }

    public function update(ManageAppointmentRequest $request, int $id): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $appointment = $barbershop->appointments()->with(['barber', 'service'])->findOrFail($id);
        [$barber, $service] = $this->resolveOwnedResources($barbershop, $request->integer('barber_id'), $request->integer('service_id'));
        [$startsAtUtc, $endsAtUtc] = $this->resolveSchedule($barbershop, $service, $request->string('starts_at')->toString());

        try {
            DB::transaction(function () use ($request, $appointment, $barber, $service, $startsAtUtc, $endsAtUtc) {
                $this->ensureSlotStillAvailable($barber->id, $startsAtUtc, $appointment->id);
                $this->ensureNoConflict($barber->id, $startsAtUtc, $endsAtUtc, $appointment->id);

                $appointment->update([
                    'barber_id' => $barber->id,
                    'service_id' => $service->id,
                    'client_name' => $request->validated('client_name'),
                    'client_phone' => $request->validated('client_phone'),
                    'client_email' => $request->validated('client_email'),
                    'starts_at' => $startsAtUtc,
                    'ends_at' => $endsAtUtc,
                    'notes' => $request->validated('notes'),
                    'status' => $request->validated('status') ?? 'booked',
                ]);
            }, 3);
        } catch (QueryException $exception) {
            if ($this->isDuplicateSlotException($exception)) {
                $this->throwSlotUnavailable();
            }

            throw $exception;
        }

        return response()->json([
            'message' => 'Agendamento atualizado com sucesso.',
            'appointment' => $this->formatAppointment($appointment->fresh()->load(['barber', 'service']), $barbershop->timezone),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $appointment = $barbershop->appointments()->findOrFail($id);
        $appointment->delete();

        return response()->json([
            'message' => 'Agendamento removido com sucesso.',
        ]);
    }

    private function resolveBarbershop(Request $request): Barbershop
    {
        $barbershop = $request->user()?->barbershop;

        if ($barbershop) {
            return $barbershop;
        }

        throw new HttpResponseException(
            response()->json([
                'message' => 'Ainda não tens nenhuma barbearia criada.',
            ], 404)
        );
    }

    private function resolveOwnedResources(Barbershop $barbershop, int $barberId, int $serviceId): array
    {
        $barber = $barbershop->barbers()->findOrFail($barberId);
        $service = $barbershop->services()->findOrFail($serviceId);

        return [$barber, $service];
    }

    private function resolveSchedule(Barbershop $barbershop, Service $service, string $startsAtInput): array
    {
        $startsAtUtc = CarbonImmutable::parse($startsAtInput, $barbershop->timezone)->utc();
        $endsAtUtc = $startsAtUtc->addMinutes((int) $service->duration_minutes);

        return [$startsAtUtc, $endsAtUtc];
    }

    private function ensureNoConflict(int $barberId, CarbonImmutable $startsAtUtc, CarbonImmutable $endsAtUtc, ?int $ignoreAppointmentId = null): void
    {
        if (! $this->conflicts->hasConflict($barberId, $startsAtUtc, $endsAtUtc, $ignoreAppointmentId)) {
            return;
        }

        $this->throwSlotUnavailable();
    }

    private function ensureSlotStillAvailable(int $barberId, CarbonImmutable $startsAtUtc, ?int $ignoreAppointmentId = null): void
    {
        $existingAppointment = Appointment::query()
            ->where('barber_id', $barberId)
            ->where('starts_at', $startsAtUtc)
            ->when($ignoreAppointmentId, fn ($query) => $query->whereKeyNot($ignoreAppointmentId))
            ->lockForUpdate()
            ->first();

        if ($existingAppointment) {
            $this->throwSlotUnavailable();
        }
    }

    private function throwSlotUnavailable(): never
    {
        throw ValidationException::withMessages([
            'starts_at' => ['Este horário já não está disponível'],
        ]);
    }

    private function isDuplicateSlotException(QueryException $exception): bool
    {
        $message = strtolower($exception->getMessage());

        return str_contains($message, 'appointments_barber_start_unique')
            || str_contains($message, 'unique constraint')
            || str_contains($message, 'duplicate entry');
    }

    private function formatAppointment(Appointment $appointment, string $timezone): array
    {
        return [
            'id' => $appointment->id,
            'barbershop_id' => $appointment->barbershop_id,
            'barber_id' => $appointment->barber_id,
            'service_id' => $appointment->service_id,
            'client_name' => $appointment->client_name,
            'client_phone' => $appointment->client_phone,
            'client_email' => $appointment->client_email,
            'starts_at' => $appointment->starts_at?->copy()->timezone($timezone)->toIso8601String(),
            'ends_at' => $appointment->ends_at?->copy()->timezone($timezone)->toIso8601String(),
            'notes' => $appointment->notes,
            'status' => $this->appointmentStatusValue($appointment),
            'created_at' => $appointment->created_at,
            'updated_at' => $appointment->updated_at,
            'barber' => $appointment->barber ? [
                'id' => $appointment->barber->id,
                'name' => $appointment->barber->name,
            ] : null,
            'service' => $appointment->service ? [
                'id' => $appointment->service->id,
                'name' => $appointment->service->name,
                'duration_minutes' => $appointment->service->duration_minutes,
                'price' => $appointment->service->price,
            ] : null,
        ];
    }

    private function appointmentStatusValue(Appointment $appointment): string
    {
        return $appointment->status instanceof \BackedEnum ? $appointment->status->value : (string) $appointment->status;
    }
}
