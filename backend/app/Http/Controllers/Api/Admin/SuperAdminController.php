<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Barbershop;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SuperAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorizeSuperAdmin($request);

        $users = User::query()
            ->with('barbershop')
            ->latest()
            ->get();
        $barbershops = Barbershop::query()
            ->with('user')
            ->latest()
            ->get();

        return response()->json([
            'summary' => [
                'users_total' => $users->count(),
                'users_active' => $users->where('is_active', true)->count(),
                'users_inactive' => $users->where('is_active', false)->count(),
                'clients_total' => $users->filter(fn (User $user) => $this->roleValue($user) === UserRole::Client->value)->count(),
                'owners_total' => $users->filter(fn (User $user) => $this->roleValue($user) === UserRole::Owner->value)->count(),
                'barbershops_total' => $barbershops->count(),
                'barbershops_active' => $barbershops->where('is_active', true)->count(),
                'barbershops_inactive' => $barbershops->where('is_active', false)->count(),
            ],
            'users' => $users->map(fn (User $user) => $this->formatUser($user))->values(),
            'barbershops' => $barbershops->map(fn (Barbershop $barbershop) => $this->formatBarbershop($barbershop))->values(),
        ]);
    }

    public function updateUserStatus(Request $request, User $user): JsonResponse
    {
        $this->authorizeSuperAdmin($request);
        $payload = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        if ($this->isProtectedSuperAdmin($user) && ! $payload['is_active']) {
            throw ValidationException::withMessages([
                'is_active' => ['Não podes desativar a conta principal de super admin.'],
            ]);
        }

        $user->forceFill([
            'is_active' => (bool) $payload['is_active'],
            'disabled_at' => $payload['is_active'] ? null : now(),
        ])->save();

        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $user->is_active ? 'Conta ativada com sucesso.' : 'Conta desativada com sucesso.',
            'user' => $this->formatUser($user->fresh('barbershop')),
        ]);
    }

    public function updateBarbershopStatus(Request $request, Barbershop $barbershop): JsonResponse
    {
        $this->authorizeSuperAdmin($request);
        $payload = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $barbershop->forceFill([
            'is_active' => (bool) $payload['is_active'],
        ])->save();

        return response()->json([
            'message' => $barbershop->is_active ? 'Barbearia ativada com sucesso.' : 'Barbearia desativada com sucesso.',
            'barbershop' => $this->formatBarbershop($barbershop->fresh('user')),
        ]);
    }

    private function authorizeSuperAdmin(Request $request): User
    {
        $user = $request->user();

        if (! $user?->isSuperAdmin()) {
            abort(403, 'Apenas o super admin pode aceder a esta área.');
        }

        return $user;
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $this->roleValue($user),
            'is_active' => (bool) $user->is_active,
            'is_super_admin' => $user->isSuperAdmin(),
            'disabled_at' => $user->disabled_at,
            'created_at' => $user->created_at,
            'barbershop' => $user->barbershop ? [
                'id' => $user->barbershop->id,
                'name' => $user->barbershop->name,
                'slug' => $user->barbershop->slug,
                'is_active' => (bool) $user->barbershop->is_active,
                'created_at' => $user->barbershop->created_at,
            ] : null,
        ];
    }

    private function roleValue(User $user): string
    {
        return $user->role instanceof \BackedEnum ? $user->role->value : (string) $user->role;
    }

    private function isProtectedSuperAdmin(User $user): bool
    {
        $configuredEmail = (string) config('saas.super_admin_email');

        return $configuredEmail !== ''
            && strcasecmp($user->email, $configuredEmail) === 0;
    }

    private function formatBarbershop(Barbershop $barbershop): array
    {
        return [
            'id' => $barbershop->id,
            'name' => $barbershop->name,
            'slug' => $barbershop->slug,
            'email' => $barbershop->email,
            'phone' => $barbershop->phone,
            'is_active' => (bool) $barbershop->is_active,
            'created_at' => $barbershop->created_at,
            'owner' => $barbershop->user ? [
                'id' => $barbershop->user->id,
                'name' => $barbershop->user->name,
                'email' => $barbershop->user->email,
                'is_active' => (bool) $barbershop->user->is_active,
            ] : null,
        ];
    }
}
