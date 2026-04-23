<?php

namespace App\Http\Resources\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarbershopResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $backgroundImageUrl = $this->background_image_data_url
            ?? $this->background_image_url
            ?? $this->image_url;
        $logoUrl = $this->logo_data_url ?? $this->logo_url;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'address' => $this->address,
            'phone' => $this->phone,
            'description' => $this->description,
            'timezone' => $this->timezone,
            'image_url' => $backgroundImageUrl,
            'background_image_url' => $backgroundImageUrl,
            'logo_url' => $logoUrl,
            'instagram_url' => $this->instagram_url,
            'facebook_url' => $this->facebook_url,
            'services' => $this->whenLoaded('services', fn () => $this->services->map(fn ($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'duration_minutes' => $service->duration_minutes,
                'price' => $service->price,
            ])),
            'barbers' => $this->whenLoaded('barbers', fn () => $this->barbers->map(fn ($barber) => [
                'id' => $barber->id,
                'name' => $barber->name,
                'photo_url' => $barber->photo_url,
            ])),
        ];
    }
}
