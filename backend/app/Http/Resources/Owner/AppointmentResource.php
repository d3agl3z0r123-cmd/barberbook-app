<?php

namespace App\Http\Resources\Owner;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $timezone = $this->barbershop->timezone ?: config('saas.default_timezone');

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'source' => $this->source,
            'notes' => $this->notes,
            'starts_at_utc' => $this->starts_at?->copy()->utc()->toIso8601String(),
            'ends_at_utc' => $this->ends_at?->copy()->utc()->toIso8601String(),
            'starts_at_local' => $this->starts_at?->copy()->timezone($timezone)->toIso8601String(),
            'ends_at_local' => $this->ends_at?->copy()->timezone($timezone)->toIso8601String(),
            'client' => [
                'id' => $this->client?->id,
                'name' => $this->client?->name,
            ],
            'barber' => [
                'id' => $this->barber?->id,
                'name' => $this->barber?->name,
            ],
            'service' => [
                'id' => $this->service?->id,
                'name' => $this->service?->name,
                'duration_minutes' => $this->service?->duration_minutes,
                'price' => $this->service?->price,
            ],
        ];
    }
}
