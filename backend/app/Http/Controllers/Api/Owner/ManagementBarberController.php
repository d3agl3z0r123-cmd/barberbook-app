<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ManageBarberRequest;
use App\Models\Barber;
use App\Models\Barbershop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManagementBarberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);

        return response()->json([
            'barbers' => $barbershop->barbers()->latest()->get()->map(fn (Barber $barber) => $this->formatBarber($barber)),
        ]);
    }

    public function store(ManageBarberRequest $request): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);

        $barber = $barbershop->barbers()->create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Barbeiro criado com sucesso.',
            'barber' => $this->formatBarber($barber),
        ], 201);
    }

    public function update(ManageBarberRequest $request, int $id): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $barber = $barbershop->barbers()->findOrFail($id);

        $barber->update([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
        ]);

        return response()->json([
            'message' => 'Barbeiro atualizado com sucesso.',
            'barber' => $this->formatBarber($barber->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $barber = $barbershop->barbers()->findOrFail($id);

        $barber->delete();

        return response()->json([
            'message' => 'Barbeiro removido com sucesso.',
        ]);
    }

    private function resolveBarbershop(Request $request): Barbershop
    {
        return $request->user()?->barbershop
            ?? abort(404, 'Barbearia ainda não criada.');
    }

    private function formatBarber(Barber $barber): array
    {
        return [
            'id' => $barber->id,
            'barbershop_id' => $barber->barbershop_id,
            'name' => $barber->name,
            'email' => $barber->email,
            'phone' => $barber->phone,
            'created_at' => $barber->created_at,
            'updated_at' => $barber->updated_at,
        ];
    }
}
