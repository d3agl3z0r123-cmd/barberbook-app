<?php

namespace App\Http\Resources\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarbershopResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'address' => $this->address,
            'phone' => $this->phone,
            'description' => $this->description,
            'timezone' => $this->timezone,
            'services' => $this->whenLoaded('services', fn () => $this->services->map(fn ($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'duration_minutes' => $service->duration_minutes,
                'price' => $service->price,
            ])),
            'barbers' => $this->whenLoaded('barbers', fn () => $this->barbers->map(fn ($barber) => [
                'id' => $barber->id,
                'name' => $barber->name,
            ])),
        ];
    }
}
