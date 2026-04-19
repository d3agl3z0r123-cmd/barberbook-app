<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreUserBarbershopRequest;
use App\Http\Requests\Owner\UpdateUserBarbershopRequest;
use App\Models\Barbershop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserBarbershopController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $barbershop = $request->user()?->barbershop;

        if (! $barbershop) {
            return response()->json([
                'message' => 'Barbearia ainda nao criada.',
            ], 404);
        }

        return response()->json([
            'barbershop' => $this->formatBarbershop($barbershop),
        ]);
    }

    public function store(StoreUserBarbershopRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user?->barbershop) {
            throw ValidationException::withMessages([
                'barbershop' => ['Cada utilizador pode ter apenas uma barbearia.'],
            ]);
        }

        $payload = $request->validated();
        $slug = $this->resolveSlug($payload['name'], $payload['slug'] ?? null);

        $barbershop = Barbershop::query()->create([
            'user_id' => $user->id,
            'owner_id' => $user->id,
            'name' => $payload['name'],
            'slug' => $slug,
            'phone' => $payload['phone'] ?? null,
            'email' => $payload['email'] ?? null,
            'address' => $payload['address'] ?? null,
            'timezone' => $payload['timezone'] ?? 'Atlantic/Azores',
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Barbearia criada com sucesso.',
            'barbershop' => $this->formatBarbershop($barbershop),
        ], 201);
    }

    public function update(UpdateUserBarbershopRequest $request): JsonResponse
    {
        $barbershop = $request->user()?->barbershop;

        if (! $barbershop) {
            return response()->json([
                'message' => 'Barbearia ainda nao criada.',
            ], 404);
        }

        $payload = $request->validated();

        if (array_key_exists('name', $payload) || array_key_exists('slug', $payload)) {
            $barbershop->slug = $this->resolveSlug(
                $payload['name'] ?? $barbershop->name,
                $payload['slug'] ?? $barbershop->slug,
                $barbershop->id
            );
        }

        $barbershop->fill([
            'name' => $payload['name'] ?? $barbershop->name,
            'phone' => $payload['phone'] ?? $barbershop->phone,
            'email' => $payload['email'] ?? $barbershop->email,
            'address' => $payload['address'] ?? $barbershop->address,
            'timezone' => $payload['timezone'] ?? $barbershop->timezone,
        ]);
        $barbershop->save();

        return response()->json([
            'message' => 'Barbearia atualizada com sucesso.',
            'barbershop' => $this->formatBarbershop($barbershop->fresh()),
        ]);
    }

    private function resolveSlug(string $name, ?string $slug = null, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($slug ?: $name);
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'barbearia';
        $candidate = $baseSlug;
        $suffix = 1;

        while (
            Barbershop::query()
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('slug', $candidate)
                ->exists()
        ) {
            $candidate = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $candidate;
    }

    private function formatBarbershop(Barbershop $barbershop): array
    {
        return [
            'id' => $barbershop->id,
            'user_id' => $barbershop->user_id,
            'name' => $barbershop->name,
            'slug' => $barbershop->slug,
            'phone' => $barbershop->phone,
            'email' => $barbershop->email,
            'address' => $barbershop->address,
            'timezone' => $barbershop->timezone,
            'created_at' => $barbershop->created_at,
            'updated_at' => $barbershop->updated_at,
        ];
    }
}
