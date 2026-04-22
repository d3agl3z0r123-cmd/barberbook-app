<?php

namespace App\Http\Controllers\Api\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Throwable;

class SocialAuthController extends Controller
{
    public function redirectToGoogle(): RedirectResponse
    {
        if ($missing = $this->missingGoogleConfiguration()) {
            Log::warning('Google OAuth configuration missing.', ['missing' => $missing]);

            return $this->redirectWithError('Faltam variáveis de ambiente OAuth: '.implode(', ', $missing).'.');
        }

        try {
            return Socialite::driver('google')
                ->stateless()
                ->redirect();
        } catch (Throwable $exception) {
            Log::error('Failed to start Google OAuth redirect.', [
                'message' => $exception->getMessage(),
            ]);

            return $this->redirectWithError('Não foi possível iniciar o login com Google.');
        }
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            Log::warning('Google OAuth cancelled or rejected.', [
                'error' => $request->query('error'),
                'description' => $request->query('error_description'),
            ]);

            return $this->redirectWithError('O login com Google foi cancelado ou recusado.');
        }

        if ($missing = $this->missingGoogleConfiguration()) {
            Log::warning('Google OAuth callback configuration missing.', ['missing' => $missing]);

            return $this->redirectWithError('Faltam variáveis de ambiente OAuth: '.implode(', ', $missing).'.');
        }

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $result = $this->findOrCreateGoogleUser($googleUser);
            $user = $result['user'];

            if (! $user->is_active) {
                return $this->redirectWithError('Esta conta está desativada. Contacta o suporte BarberBook.');
            }

            $token = $user->createToken('google-oauth')->plainTextToken;

            Log::info('Google OAuth login completed.', [
                'user_id' => $user->id,
                'is_new_user' => $result['is_new_user'],
            ]);

            return redirect()->away($this->frontendCallbackUrl([
                'token' => $token,
                'token_type' => 'Bearer',
                'role' => $user->role instanceof UserRole ? $user->role->value : (string) $user->role,
                'provider' => 'google',
                'is_new_user' => $result['is_new_user'] ? '1' : '0',
            ]));
        } catch (Throwable $exception) {
            Log::error('Google OAuth callback failed.', [
                'class' => $exception::class,
                'message' => $exception->getMessage(),
                'google_redirect_uri' => config('services.google.redirect'),
            ]);

            return $this->redirectWithError($this->googleOAuthErrorMessage($exception));
        }
    }

    public function providers(): array
    {
        $missing = $this->missingGoogleConfiguration();

        return [
            'providers' => [
                'google' => [
                    'enabled' => $missing === [],
                    'missing_configuration' => $missing === [] ? null : 'Faltam variáveis de ambiente OAuth: '.implode(', ', $missing).'.',
                    'redirect_url' => url('/api/auth/google/redirect'),
                    'callback_url' => config('services.google.redirect'),
                ],
            ],
        ];
    }

    /**
     * @return array{user: User, is_new_user: bool}
     */
    private function findOrCreateGoogleUser(SocialiteUser $googleUser): array
    {
        return DB::transaction(function () use ($googleUser): array {
            $providerId = (string) $googleUser->getId();
            $email = Str::lower((string) $googleUser->getEmail());

            if ($providerId === '') {
                throw new \RuntimeException('O Google não devolveu um identificador válido.');
            }

            if (! $email) {
                throw new \RuntimeException('O Google não devolveu um e-mail válido.');
            }

            $account = SocialAccount::query()
                ->where('provider', 'google')
                ->where('provider_id', $providerId)
                ->first();

            if ($account) {
                $this->updateGoogleAccount($account, $googleUser);

                return [
                    'user' => $account->user,
                    'is_new_user' => false,
                ];
            }

            $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
            $isNewUser = false;

            if (! $user) {
                $isNewUser = true;
                $user = User::query()->create([
                    'name' => $this->resolveName($googleUser, $email),
                    'email' => $email,
                    'password' => Hash::make(Str::random(48)),
                    'role' => UserRole::Client->value,
                    'timezone' => config('saas.default_timezone', 'Atlantic/Azores'),
                    'email_verified_at' => now(),
                ]);
            }

            $this->syncSuperAdminRole($user, $email);

            $account = SocialAccount::query()->create([
                'user_id' => $user->id,
                'provider' => 'google',
                'provider_id' => $providerId,
                'email' => $email,
                'name' => $googleUser->getName() ?: $user->name,
                'avatar' => $googleUser->getAvatar(),
                'metadata' => [
                    'authenticated_with' => 'google',
                    'nickname' => $googleUser->getNickname(),
                    'raw' => $googleUser->user,
                ],
            ]);

            return [
                'user' => $account->user,
                'is_new_user' => $isNewUser,
            ];
        });
    }

    private function updateGoogleAccount(SocialAccount $account, SocialiteUser $googleUser): void
    {
        $account->forceFill([
            'email' => Str::lower((string) ($googleUser->getEmail() ?: $account->email)),
            'name' => $googleUser->getName() ?: $account->name,
            'avatar' => $googleUser->getAvatar() ?: $account->avatar,
            'metadata' => [
                'authenticated_with' => 'google',
                'nickname' => $googleUser->getNickname(),
                'raw' => $googleUser->user,
            ],
        ])->save();
    }

    private function syncSuperAdminRole(User $user, string $email): void
    {
        $superAdminEmail = Str::lower((string) config('saas.super_admin_email'));

        if ($superAdminEmail === '' || $email !== $superAdminEmail) {
            return;
        }

        $user->forceFill([
            'role' => UserRole::Admin,
            'is_active' => true,
            'is_super_admin' => true,
            'disabled_at' => null,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();
    }

    private function resolveName(SocialiteUser $googleUser, string $email): string
    {
        return $googleUser->getName()
            ?: $googleUser->getNickname()
            ?: Str::headline(Str::before($email, '@'))
            ?: 'Cliente BarberBook';
    }

    /**
     * @return array<int, string>
     */
    private function missingGoogleConfiguration(): array
    {
        $required = [
            'GOOGLE_CLIENT_ID' => config('services.google.client_id'),
            'GOOGLE_CLIENT_SECRET' => config('services.google.client_secret'),
            'GOOGLE_REDIRECT_URI' => config('services.google.redirect'),
        ];

        return array_keys(array_filter($required, fn ($value) => blank($value)));
    }

    private function redirectWithError(string $message): RedirectResponse
    {
        return redirect()->away($this->frontendCallbackUrl([
            'error' => $message,
        ]));
    }

    private function googleOAuthErrorMessage(Throwable $exception): string
    {
        $message = Str::lower($exception->getMessage());
        $redirectUri = (string) config('services.google.redirect');

        if (Str::contains($message, 'redirect_uri_mismatch')) {
            return "O callback URL do Google não está autorizado. Adiciona exatamente este URL no Google Cloud: {$redirectUri}";
        }

        if (Str::contains($message, 'invalid_client')) {
            return 'As credenciais Google OAuth estão inválidas. Confirma GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET na Railway.';
        }

        if (Str::contains($message, 'invalid_grant')) {
            return 'O código de autorização do Google expirou ou não corresponde ao callback configurado. Tenta novamente e confirma o GOOGLE_REDIRECT_URI.';
        }

        return "Não foi possível concluir o login com Google. Confirma as credenciais OAuth e este callback URL: {$redirectUri}";
    }

    private function frontendCallbackUrl(array $query): string
    {
        return rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/')
            .'/auth/social-callback?'.http_build_query($query);
    }
}
