<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ManageAppointmentRequest;
use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Barbershop;
use App\Models\Service;
use App\Services\AppointmentConflictService;
use App\Services\AppointmentExcelExportService;
use App\Services\AppointmentNotificationService;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Validation\ValidationException;

class ManagementAppointmentController extends Controller
{
    public function __construct(
        private readonly AppointmentConflictService $conflicts,
        private readonly AppointmentExcelExportService $excelExport,
        private readonly AppointmentNotificationService $notifications,
    )
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
            'revenue' => $this->appointmentRevenue($appointments),
            'clients' => $this->uniqueClientCount($appointments),
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

    public function statistics(Request $request): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $timezone = $barbershop->timezone ?: 'Atlantic/Azores';
        $appointments = $barbershop->appointments()
            ->with(['barber', 'service'])
            ->orderBy('starts_at')
            ->get();
        $validAppointments = $appointments->reject(fn (Appointment $appointment) => $this->isInvalidForStats($appointment));
        $now = now($timezone)->toImmutable();
        $today = $now->startOfDay();
        $monthStart = $now->startOfMonth();
        $todayAppointments = $validAppointments->filter(fn (Appointment $appointment) => $appointment->starts_at?->copy()->timezone($timezone)->isSameDay($today));
        $monthAppointments = $validAppointments->filter(fn (Appointment $appointment) => $appointment->starts_at?->copy()->timezone($timezone)->greaterThanOrEqualTo($monthStart));
        $services = $validAppointments
            ->groupBy(fn (Appointment $appointment) => (string) ($appointment->service?->id ?? 0))
            ->map(fn ($items) => [
                'service_id' => $items->first()?->service?->id,
                'name' => $items->first()?->service?->name ?? 'Serviço removido',
                'appointments' => $items->count(),
                'revenue' => $this->appointmentRevenue($items),
            ])
            ->sortByDesc('appointments')
            ->values()
            ->take(5);

        return response()->json([
            'timezone' => $timezone,
            'summary' => [
                'appointments_total' => $validAppointments->count(),
                'appointments_today' => $todayAppointments->count(),
                'appointments_month' => $monthAppointments->count(),
                'revenue_total' => $this->appointmentRevenue($validAppointments),
                'revenue_today' => $this->appointmentRevenue($todayAppointments),
                'revenue_month' => $this->appointmentRevenue($monthAppointments),
                'clients_total' => $this->uniqueClientCount($validAppointments),
                'services_used' => $services,
            ],
            'clients' => $this->clientRows($validAppointments, $timezone),
            'updated_at' => now()->toIso8601String(),
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $payload = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $barbershop = $this->resolveBarbershop($request);
        $timezone = $barbershop->timezone ?: 'Atlantic/Azores';
        $appointmentsQuery = $barbershop->appointments()
            ->with(['barber', 'service'])
            ->orderBy('starts_at');

        if (isset($payload['date'])) {
            $day = CarbonImmutable::createFromFormat('Y-m-d', $payload['date'], $timezone)->startOfDay();

            $appointmentsQuery->whereBetween('starts_at', [
                $day->utc(),
                $day->endOfDay()->utc(),
            ]);
        }

        $path = $this->excelExport->export($barbershop, $appointmentsQuery->get());
        $dateSuffix = $payload['date'] ?? now($timezone)->format('Y-m-d');
        $filename = sprintf('barberbook-agenda-%s-%s.xlsx', $barbershop->slug, $dateSuffix);

        return response()->download(
            $path,
            $filename,
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        )->deleteFileAfterSend();
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
                    'source' => 'backoffice',
                ]);
            }, 3);
        } catch (QueryException $exception) {
            if ($this->isDuplicateSlotException($exception)) {
                $this->throwSlotUnavailable();
            }

            throw $exception;
        }

        $this->notifications->dispatchConfirmation($appointment->fresh(['barbershop.user', 'barber', 'service']));

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

    private function isInvalidForStats(Appointment $appointment): bool
    {
        return in_array($this->appointmentStatusValue($appointment), ['cancelled', 'no_show'], true);
    }

    private function appointmentRevenue(iterable $appointments): float
    {
        $total = 0.0;

        foreach ($appointments as $appointment) {
            if ($this->isInvalidForStats($appointment)) {
                continue;
            }

            $total += (float) ($appointment->service?->price ?? 0);
        }

        return round($total, 2);
    }

    private function uniqueClientCount(iterable $appointments): int
    {
        $clients = [];

        foreach ($appointments as $appointment) {
            if ($this->isInvalidForStats($appointment)) {
                continue;
            }

            $key = strtolower(trim((string) ($appointment->client_email ?: $appointment->client_phone ?: $appointment->client_name)));

            if ($key !== '') {
                $clients[$key] = true;
            }
        }

        return count($clients);
    }

    private function clientRows(iterable $appointments, string $timezone): array
    {
        $clients = [];

        foreach ($appointments as $appointment) {
            if ($this->isInvalidForStats($appointment)) {
                continue;
            }

            $key = strtolower(trim((string) ($appointment->client_email ?: $appointment->client_phone ?: $appointment->client_name)));

            if ($key === '') {
                continue;
            }

            $current = $clients[$key] ?? [
                'name' => $appointment->client_name,
                'phone' => $appointment->client_phone,
                'email' => $appointment->client_email,
                'appointments' => 0,
                'last_appointment_at' => null,
            ];

            $current['appointments']++;
            $last = $current['last_appointment_at'] ? CarbonImmutable::parse($current['last_appointment_at']) : null;

            if (! $last || ($appointment->starts_at && $appointment->starts_at->greaterThan($last))) {
                $current['last_appointment_at'] = $appointment->starts_at?->copy()->timezone($timezone)->toIso8601String();
            }

            $clients[$key] = $current;
        }

        usort($clients, fn (array $a, array $b) => strcmp((string) $b['last_appointment_at'], (string) $a['last_appointment_at']));

        return array_values($clients);
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
