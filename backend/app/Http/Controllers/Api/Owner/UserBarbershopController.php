<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreUserBarbershopRequest;
use App\Http\Requests\Owner\UpdateUserBarbershopRequest;
use App\Models\Barbershop;
use App\Services\BarbershopQrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserBarbershopController extends Controller
{
    public function __construct(private readonly BarbershopQrCodeService $qrCodes)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $barbershop = $request->user()?->barbershop;

        if (! $barbershop) {
            return response()->json([
                'message' => 'Barbearia ainda não criada.',
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
        $this->ensureNotRecentDuplicate($request, 'barbershop', $payload);
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
            'instagram_url' => $payload['instagram_url'] ?? null,
            'facebook_url' => $payload['facebook_url'] ?? null,
            'is_active' => true,
        ]);
        $barbershop = $this->qrCodes->ensure($barbershop);

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
                'message' => 'Barbearia ainda não criada.',
            ], 404);
        }

        $payload = $request->validated();
        $previousSlug = $barbershop->slug;

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
            'instagram_url' => array_key_exists('instagram_url', $payload) ? $payload['instagram_url'] : $barbershop->instagram_url,
            'facebook_url' => array_key_exists('facebook_url', $payload) ? $payload['facebook_url'] : $barbershop->facebook_url,
        ]);
        $barbershop->save();
        $barbershop = $barbershop->fresh();
        $barbershop = $barbershop->slug !== $previousSlug
            ? $this->qrCodes->regenerate($barbershop)
            : $this->qrCodes->ensure($barbershop);

        return response()->json([
            'message' => 'Barbearia atualizada com sucesso.',
            'barbershop' => $this->formatBarbershop($barbershop),
        ]);
    }

    public function branding(Request $request): JsonResponse
    {
        $barbershop = $request->user()?->barbershop;

        if (! $barbershop) {
            return response()->json([
                'message' => 'Barbearia ainda não criada.',
            ], 404);
        }

        $payload = $request->validate([
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'background_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
        ]);

        if ($request->hasFile('background_image') || $request->hasFile('image')) {
            $field = $request->hasFile('background_image') ? 'background_image' : 'image';
            $barbershop->background_image_data_url = $this->imageDataUrl($request, $field);
            $barbershop->background_image_path = $this->storeBrandImage($request, $barbershop, $field, 'backgrounds', $barbershop->background_image_path ?? $barbershop->image_path);
            $barbershop->background_image_url = $this->publicAssetUrl($barbershop->background_image_path);
            $barbershop->image_path = $barbershop->background_image_path;
            $barbershop->image_url = $barbershop->background_image_url;
        }

        if ($request->hasFile('logo')) {
            $barbershop->logo_data_url = $this->imageDataUrl($request, 'logo');
            $barbershop->logo_path = $this->storeBrandImage($request, $barbershop, 'logo', 'logos', $barbershop->logo_path);
            $barbershop->logo_url = $this->publicAssetUrl($barbershop->logo_path);
        }

        $barbershop->instagram_url = $payload['instagram_url'] ?? null;
        $barbershop->facebook_url = $payload['facebook_url'] ?? null;
        $barbershop->save();

        return response()->json([
            'message' => 'Personalização atualizada com sucesso.',
            'barbershop' => $this->formatBarbershop($barbershop->fresh()),
        ]);
    }

    private function imageDataUrl(Request $request, string $field): ?string
    {
        $file = $request->file($field);

        if (! $file) {
            return null;
        }

        $mimeType = $file->getMimeType() ?: 'image/jpeg';
        $contents = File::get($file->getRealPath());

        return 'data:'.$mimeType.';base64,'.base64_encode($contents);
    }

    private function storeBrandImage(Request $request, Barbershop $barbershop, string $field, string $folder, ?string $currentPath = null): string
    {
        $file = $request->file($field);
        $extension = $file?->getClientOriginalExtension() ?: 'jpg';
        $directory = public_path('uploads/barbershops/'.$folder);

        File::ensureDirectoryExists($directory);

        if ($currentPath) {
            $previousPath = public_path($currentPath);

            if (File::exists($previousPath)) {
                File::delete($previousPath);
            }
        }

        $filename = sprintf('%s-%s-%s.%s', $barbershop->slug, $folder, Str::random(12), strtolower($extension));
        $relativePath = 'uploads/barbershops/'.$folder.'/'.$filename;

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

    private function formatBarbershop(Barbershop $barbershop): array
    {
        $backgroundImageUrl = $barbershop->background_image_data_url
            ?? $barbershop->background_image_url
            ?? $barbershop->image_url;
        $logoUrl = $barbershop->logo_data_url ?? $barbershop->logo_url;

        return [
            'id' => $barbershop->id,
            'user_id' => $barbershop->user_id,
            'name' => $barbershop->name,
            'slug' => $barbershop->slug,
            'phone' => $barbershop->phone,
            'email' => $barbershop->email,
            'address' => $barbershop->address,
            'timezone' => $barbershop->timezone,
            'image_path' => $barbershop->image_path,
            'image_url' => $backgroundImageUrl,
            'background_image_path' => $barbershop->background_image_path ?? $barbershop->image_path,
            'background_image_url' => $backgroundImageUrl,
            'logo_path' => $barbershop->logo_path,
            'logo_url' => $logoUrl,
            'instagram_url' => $barbershop->instagram_url,
            'facebook_url' => $barbershop->facebook_url,
            'qr_path' => $barbershop->qr_path,
            'qr_url' => $barbershop->qr_url,
            'qr_generated_at' => $barbershop->qr_generated_at,
            'qr_last_regenerated_at' => $barbershop->qr_last_regenerated_at,
            'qr_metadata' => $barbershop->qr_metadata,
            'qr_scan_count' => $barbershop->qr_scan_count ?? 0,
            'qr_last_scanned_at' => $barbershop->qr_last_scanned_at,
            'created_at' => $barbershop->created_at,
            'updated_at' => $barbershop->updated_at,
        ];
    }
}
