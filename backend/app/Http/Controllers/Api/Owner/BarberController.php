<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreBarberRequest;
use App\Models\Barber;
use App\Models\Barbershop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarberController extends Controller
{
    public function index(Request $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);

        return response()->json($barbershop->barbers()->latest()->get());
    }

    public function store(StoreBarberRequest $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);

        $barber = $barbershop->barbers()->create($request->validated());

        return response()->json($barber, 201);
    }

    public function update(StoreBarberRequest $request, Barbershop $barbershop, Barber $barber): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);
        abort_unless($barber->barbershop_id === $barbershop->id, 404);

        $barber->update($request->validated());

        return response()->json($barber);
    }

    public function destroy(Request $request, Barbershop $barbershop, Barber $barber): JsonResponse
    {
        $this->authorizeOwner($request, $barbershop);
        abort_unless($barber->barbershop_id === $barbershop->id, 404);

        $barber->delete();

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
