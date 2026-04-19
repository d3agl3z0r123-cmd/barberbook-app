<?php

namespace App\Http\Controllers\Api\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Barbershop;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $role = $payload['role'] ?? UserRole::Client->value;

        $user = DB::transaction(function () use ($payload): User {
            $user = User::query()->create([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'password' => $payload['password'],
                'phone' => $payload['phone'] ?? null,
                'role' => $payload['role'] ?? UserRole::Client->value,
                'timezone' => config('saas.default_timezone'),
            ]);

            if (($payload['role'] ?? UserRole::Client->value) === UserRole::Owner->value) {
                $barbershop = Barbershop::query()->create([
                    'user_id' => $user->id,
                    'owner_id' => $user->id,
                    'name' => $payload['barbershop']['name'],
                    'slug' => $payload['barbershop']['slug'],
                    'email' => $user->email,
                    'timezone' => config('saas.default_timezone'),
                    'is_active' => true,
                ]);

                $user->memberships()->attach($barbershop->id, ['role' => UserRole::Owner->value]);
            }

            return $user;
        });

        $token = $user->createToken($request->userAgent() ?: 'api')->plainTextToken;

        return response()->json([
            'message' => 'Utilizador registado com sucesso.',
            'user' => $user->loadMissing('barbershop', 'memberships'),
            'role' => $role,
            'token_type' => 'Bearer',
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $user = User::query()->where('email', $payload['email'])->first();

        if (! $user || ! Hash::check($payload['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais invalidas.'],
            ]);
        }

        $token = $user->createToken($payload['device_name'] ?? 'api')->plainTextToken;

        return response()->json([
            'message' => 'Login efetuado com sucesso.',
            'user' => $user->loadMissing('barbershop', 'memberships'),
            'token_type' => 'Bearer',
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()?->load('barbershop', 'memberships'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Sessao terminada com sucesso.',
        ]);
    }
}
