<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['nullable', Rule::in([UserRole::Owner->value, UserRole::Client->value])],
            'barbershop.name' => ['required_if:role,owner', 'string', 'max:160'],
            'barbershop.slug' => ['required_if:role,owner', 'alpha_dash', 'max:160', 'unique:barbershops,slug'],
        ];
    }
}
