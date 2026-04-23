<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ManageServiceRequest;
use App\Models\Barbershop;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

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
        $payload = $request->validated();

        $this->ensureNotRecentDuplicate($request, 'service', $payload);
        $this->ensureUniqueServiceName($barbershop, $payload['name']);

        $service = $barbershop->services()->create([
            'name' => $payload['name'],
            'price' => $payload['price'],
            'duration_minutes' => $payload['duration_minutes'],
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Serviço criado com sucesso.',
            'service' => $this->formatService($service),
        ], 201);
    }

    public function update(ManageServiceRequest $request, int $id): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $service = $barbershop->services()->findOrFail($id);
        $payload = $request->validated();

        $this->ensureUniqueServiceName($barbershop, $payload['name'], $service->id);

        $service->update([
            'name' => $payload['name'],
            'price' => $payload['price'],
            'duration_minutes' => $payload['duration_minutes'],
        ]);

        return response()->json([
            'message' => 'Serviço atualizado com sucesso.',
            'service' => $this->formatService($service->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $barbershop = $this->resolveBarbershop($request);
        $service = $barbershop->services()->findOrFail($id);

        $service->delete();

        return response()->json([
            'message' => 'Serviço removido com sucesso.',
        ]);
    }

    private function resolveBarbershop(Request $request): Barbershop
    {
        return $request->user()?->barbershop
            ?? abort(404, 'Barbearia ainda não criada.');
    }

    private function ensureNotRecentDuplicate(Request $request, string $type, array $payload): void
    {
        ksort($payload);

        $key = sprintf('recent-submit:%s:%s:%s', $type, $request->user()?->id ?? 'guest', sha1(json_encode($payload)));

        if (Cache::add($key, true, now()->addSeconds(4))) {
            return;
        }

        throw ValidationException::withMessages([
            'request' => ['Este pedido já está a ser processado. Aguarda um instante.'],
        ]);
    }

    private function ensureUniqueServiceName(Barbershop $barbershop, string $name, ?int $ignoreId = null): void
    {
        $normalizedName = strtolower(trim($name));
        $query = $barbershop->services();

        if ($ignoreId) {
            $query->whereKeyNot($ignoreId);
        }

        $exists = $query
            ->whereRaw('LOWER(name) = ?', [$normalizedName])
            ->exists();

        if (! $exists) {
            return;
        }

        throw ValidationException::withMessages([
            'name' => ['Ja existe um servico com este nome.'],
        ]);
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
