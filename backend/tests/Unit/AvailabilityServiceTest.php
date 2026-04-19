<?php

namespace Tests\Unit;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Barbershop;
use App\Models\Client;
use App\Models\OperatingHour;
use App\Models\Service;
use App\Services\AvailabilityService;
use Carbon\CarbonImmutable;
use Tests\TestCase;

class AvailabilityServiceTest extends TestCase
{
    public function test_it_returns_slots_in_azores_timezone_and_skips_conflicts(): void
    {
        $shop = Barbershop::factory()->create(['timezone' => 'Atlantic/Azores']);
        $barber = Barber::factory()->create(['barbershop_id' => $shop->id]);
        $service = Service::factory()->create(['barbershop_id' => $shop->id, 'duration_minutes' => 30]);
        $client = Client::factory()->create(['barbershop_id' => $shop->id]);

        OperatingHour::factory()->create([
            'barbershop_id' => $shop->id,
            'weekday' => 3,
            'opens_at' => '09:00',
            'closes_at' => '11:00',
            'is_closed' => false,
        ]);

        Appointment::factory()->create([
            'barbershop_id' => $shop->id,
            'client_id' => $client->id,
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'starts_at' => CarbonImmutable::parse('2026-04-22 09:30', 'Atlantic/Azores')->utc(),
            'ends_at' => CarbonImmutable::parse('2026-04-22 10:00', 'Atlantic/Azores')->utc(),
            'status' => 'confirmed',
        ]);

        $slots = app(AvailabilityService::class)->forDay(
            $shop,
            $barber,
            $service,
            CarbonImmutable::parse('2026-04-22', 'Atlantic/Azores')
        );

        $this->assertTrue($slots->pluck('starts_at_local')->contains(fn ($slot) => str_contains($slot, '09:00:00')));
        $this->assertFalse($slots->pluck('starts_at_local')->contains(fn ($slot) => str_contains($slot, '09:30:00')));
    }
}
