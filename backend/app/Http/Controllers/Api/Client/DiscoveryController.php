<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\Client\BarbershopResource;
use App\Models\Barbershop;
use Illuminate\Http\JsonResponse;

class DiscoveryController extends Controller
{
    public function index(): JsonResponse
    {
        $shops = Barbershop::query()
            ->where('is_active', true)
            ->whereHas('user', fn ($query) => $query->where('is_active', true))
            ->with(['services' => fn ($query) => $query->where('is_active', true), 'barbers' => fn ($query) => $query->where('is_active', true)])
            ->páginate();

        return response()->json(BarbershopResource::collection($shops));
    }

    public function show(string $slug): JsonResponse
    {
        $shop = Barbershop::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->whereHas('user', fn ($query) => $query->where('is_active', true))
            ->with(['services' => fn ($query) => $query->where('is_active', true), 'barbers' => fn ($query) => $query->where('is_active', true)])
            ->firstOrFail();

        return response()->json(new BarbershopResource($shop));
    }
}
