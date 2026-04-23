<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ManageBarberRequest;
use App\Models\Barber;
use App\Models\Barbershop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
        $payload = $request->validated();

        $this->ensureNotRecentDuplicate($request, 'barber', $payload);
        $this->ensureUniqueContact($barbershop, $payload);

        $barber = $barbershop->barbers()->create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'],
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
        $payload = $request->validated();

        $this->ensureUniqueContact($barbershop, $payload, $barber->id);

        $barber->update([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'],
        ]);

        return response()->json([
            'message' => 'Barbeiro atualizado com sucesso.',
            'barber' => $this->formatBarber($barber->fresh()),
        ]);
    }

    public function photo(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $barbershop = $this->resolveBarbershop($request);
        $barber = $barbershop->barbers()->findOrFail($id);

        $barber->photo_path = $this->storeBarberPhoto($request, $barbershop, $barber, $barber->photo_path);
        $barber->photo_url = $this->publicAssetUrl($barber->photo_path);
        $barber->save();

        return response()->json([
            'message' => 'Foto do barbeiro atualizada com sucesso.',
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

    private function storeBarberPhoto(Request $request, Barbershop $barbershop, Barber $barber, ?string $currentPath = null): string
    {
        $file = $request->file('photo');
        $extension = $file?->getClientOriginalExtension() ?: 'jpg';
        $directory = public_path('uploads/barbers/photos');

        File::ensureDirectoryExists($directory);

        if ($currentPath) {
            $previousPath = public_path($currentPath);

            if (File::exists($previousPath)) {
                File::delete($previousPath);
            }
        }

        $filename = sprintf(
            '%s-barber-%s-%s.%s',
            $barbershop->slug,
            $barber->id,
            Str::random(12),
            strtolower($extension)
        );
        $relativePath = 'uploads/barbers/photos/'.$filename;

        $file?->move($directory, $filename);

        return $relativePath;
    }

    private function publicAssetUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $baseUrl = rtrim((string) config('app.url'), '/');

        if (! str_starts_with($baseUrl, 'http://') && ! str_starts_with($baseUrl, 'https://')) {
            $baseUrl = 'https://'.$baseUrl;
        }

        return $baseUrl.'/'.ltrim($path, '/');
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

    private function ensureUniqueContact(Barbershop $barbershop, array $payload, ?int $ignoreId = null): void
    {
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $phone = $this->normalizePhone($payload['phone'] ?? null);
        $query = $barbershop->barbers();

        if ($ignoreId) {
            $query->whereKeyNot($ignoreId);
        }

        foreach ($query->get(['id', 'email', 'phone']) as $barber) {
            if ($email !== '' && strtolower(trim((string) $barber->email)) === $email) {
                throw ValidationException::withMessages([
                    'email' => ['Ja existe um barbeiro com este e-mail.'],
                ]);
            }

            if ($phone !== '' && $this->normalizePhone($barber->phone) === $phone) {
                throw ValidationException::withMessages([
                    'phone' => ['Ja existe um barbeiro com este telemovel.'],
                ]);
            }
        }
    }

    private function normalizePhone(mixed $phone): string
    {
        return preg_replace('/\D+/', '', (string) $phone) ?: '';
    }

    private function formatBarber(Barber $barber): array
    {
        return [
            'id' => $barber->id,
            'barbershop_id' => $barber->barbershop_id,
            'name' => $barber->name,
            'email' => $barber->email,
            'phone' => $barber->phone,
            'photo_path' => $barber->photo_path,
            'photo_url' => $barber->photo_url,
            'created_at' => $barber->created_at,
            'updated_at' => $barber->updated_at,
        ];
    }
}
