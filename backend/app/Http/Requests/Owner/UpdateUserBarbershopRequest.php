<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserBarbershopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $barbershopId = $this->user()?->barbershop?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'slug' => ['nullable', 'alpha_dash', 'max:160', Rule::unique('barbershops', 'slug')->ignore($barbershopId)],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:160'],
            'address' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'timezone'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
