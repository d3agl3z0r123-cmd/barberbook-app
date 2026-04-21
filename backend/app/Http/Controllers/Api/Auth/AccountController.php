<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateAccountProfileRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function updateProfile(UpdateAccountProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->forceFill([
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
        ])->save();

        return response()->json([
            'message' => 'Dados da conta atualizados com sucesso.',
            'user' => $user->fresh()->loadMissing('barbershop', 'memberships'),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->validated('current_password'), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['A palavra-passe atual não está correta.'],
            ]);
        }

        $user->forceFill([
            'password' => $request->validated('password'),
        ])->save();

        return response()->json([
            'message' => 'Palavra-passe atualizada com sucesso.',
        ]);
    }
}
