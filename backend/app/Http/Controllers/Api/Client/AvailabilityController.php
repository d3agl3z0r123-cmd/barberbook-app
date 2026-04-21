<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\Barbershop;
use App\Models\Service;
use App\Services\AvailabilityService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function __construct(private readonly AvailabilityService $availability)
    {
    }

    public function __invoke(Request $request, string $slug): JsonResponse
    {
        $payload = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'barber_id' => ['required', 'integer', 'exists:barbers,id'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $barbershop = Barbershop::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->whereHas('user', fn ($query) => $query->where('is_active', true))
            ->firstOrFail();
        $service = Service::query()->where('barbershop_id', $barbershop->id)->findOrFail($payload['service_id']);
        $barber = Barber::query()->where('barbershop_id', $barbershop->id)->findOrFail($payload['barber_id']);
        $slots = $this->availability->forDay($barbershop, $barber, $service, CarbonImmutable::parse($payload['date'], $barbershop->timezone));

        return response()->json([
            'timezone' => $barbershop->timezone,
            'date' => $payload['date'],
            'slots' => $slots,
        ]);
    }
}
