<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ManageServiceRequest;
use App\Models\Barbershop;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManagementServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);

        return response()->json([
            'services' => $barbershop->services()->latest()->get()->map(fn (Service $service) => $this->formatService($service)),
        ]);
    }

    public function store(ManageServiceRequest $request): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);

        $service = $barbershop->services()->create([
            'name' => $request->validated('name'),
            'price' => $request->validated('price'),
            'duration_minutes' => $request->validated('duration_minutes'),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Servico criado com sucesso.',
            'service' => $this->formatService($service),
        ], 201);
    }

    public function update(ManageServiceRequest $request, int $id): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $service = $barbershop->services()->findOrFail($id);

        $service->update([
            'name' => $request->validated('name'),
            'price' => $request->validated('price'),
            'duration_minutes' => $request->validated('duration_minutes'),
        ]);

        return response()->json([
            'message' => 'Servico atualizado com sucesso.',
            'service' => $this->formatService($service->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $service = $barbershop->services()->findOrFail($id);

        $service->delete();

        return response()->json([
            'message' => 'Servico removido com sucesso.',
        ]);
    }

    private function resolveBarbershop(Request $request): Barbershop
    {
        return $request->user()?->barbershop
            ?? abort(404, 'Barbearia ainda nao criada.');
    }

    private function formatService(Service $service): array
    {
        return [
            'id' => $service->id,
            'barbershop_id' => $service->barbershop_id,
            'name' => $service->name,
            'price' => $service->price,
            'duration_minutes' => $service->duration_minutes,
            'created_at' => $service->created_at,
            'updated_at' => $service->updated_at,
        ];
    }
}
