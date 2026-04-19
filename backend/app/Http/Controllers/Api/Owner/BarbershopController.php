<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Barbershop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarbershopController extends Controller
{
    public function show(Request $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);

        return response()->json($barbershop->load('operatingHours', 'services', 'barbers'));
    }

    public function update(Request $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);

        $payload = $request->validate([
            'name' => ['sometimes', 'string', 'max:160'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'description' => ['nullable', 'string', 'max:1000'],
            'timezone' => ['sometimes', 'timezone'],
            'operating_hours' => ['sometimes', 'array'],
            'operating_hours.*.weekday' => ['required_with:operating_hours', 'integer', 'between:1,7'],
            'operating_hours.*.opens_at' => ['nullable', 'date_format:H:i'],
            'operating_hours.*.closes_at' => ['nullable', 'date_format:H:i'],
            'operating_hours.*.is_closed' => ['required_with:operating_hours', 'boolean'],
        ]);

        $barbershop->fill($payload);
        $barbershop->timezone = $payload['timezone'] ?? config('saas.default_timezone');
        $barbershop->save();

        if (isset($payload['operating_hours'])) {
            $barbershop->operatingHours()->delete();
            $barbershop->operatingHours()->createMany($payload['operating_hours']);
        }

        return response()->json($barbershop->fresh()->load('operatingHours'));
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
