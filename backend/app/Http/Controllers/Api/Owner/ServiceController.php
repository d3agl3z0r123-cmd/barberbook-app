<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreServiceRequest;
use App\Models\Barbershop;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);

        return response()->json($barbershop->services()->latest()->get());
    }

    public function store(StoreServiceRequest $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);

        $service = $barbershop->services()->create($request->validated());

        return response()->json($service, 201);
    }

    public function update(StoreServiceRequest $request, Barbershop $barbershop, Service $service): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);
        abort_unless($service->barbershop_id === $barbershop->id, 404);

        $service->update($request->validated());

        return response()->json($service);
    }

    public function destroy(Request $request, Barbershop $barbershop, Service $service): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);
        abort_unless($service->barbershop_id === $barbershop->id, 404);

        $service->delete();

        return response()->json(status: 204);
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
