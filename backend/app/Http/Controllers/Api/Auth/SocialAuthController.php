<?php

namespace App\Http\Controllers\Api\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use RuntimeException;
use Throwable;

class SocialAuthController extends Controller
{
    private const PROVIDERS = ['google', 'apple'];

    public function redirect(string $provider): RedirectResponse
    {
        if (! $this->isSupportedProvider($provider)) {
            return $this->redirectWithError('Provider de autenticação inválido.');
        }

        if ($missing = $this->missingConfiguration($provider)) {
            return $this->redirectWithError($missing);
        }

        try {
            if ($provider === 'apple') {
                return redirect()->away($this->appleAuthorizationUrl());
            }

            return Socialite::driver($provider)
                ->stateless()
                ->redirect();
        } catch (Throwable) {
            return $this->redirectWithError('Não foi possível iniciar o login social. Verifica a configuração OAuth.');
        }
    }

    public function callback(Request $request, string $provider): RedirectResponse
    {
        if (! $this->isSupportedProvider($provider)) {
            return $this->redirectWithError('Provider de autenticação inválido.');
        }

        if ($missing = $this->missingConfiguration($provider)) {
            return $this->redirectWithError($missing);
        }

        if ($request->has('error')) {
            return $this->redirectWithError('O login social foi cancelado ou recusado pelo provider.');
        }

        try {
            $profile = $provider === 'apple'
                ? $this->appleProfileFromCallback($request)
                : $this->profileFromSocialite($provider);

            $result = $this->findOrCreateUser($profile);
            $user = $result['user'];
            $token = $user->createToken("{$provider}-oauth")->plainTextToken;

            return redirect()->away($this->frontendCallbackUrl([
                'token' => $token,
                'token_type' => 'Bearer',
                'role' => $user->role instanceof UserRole ? $user->role->value : (string) $user->role,
                'provider' => $provider,
                'is_new_user' => $result['is_new_user'] ? '1' : '0',
            ]));
        } catch (Throwable $exception) {
            return $this->redirectWithError($exception->getMessage() ?: 'Não foi possível concluir o login social. Confirma as credenciais OAuth e o callback URL.');
        }
    }

    public function providers(): array
    {
        return [
            'providers' => [
                'google' => [
                    'enabled' => $this->missingConfiguration('google') === null,
                    'missing_configuration' => $this->missingConfiguration('google'),
                    'redirect_url' => url('/api/auth/google/redirect'),
                    'callback_url' => config('services.google.redirect'),
                ],
                'apple' => [
                    'enabled' => $this->missingConfiguration('apple') === null,
                    'missing_configuration' => $this->missingConfiguration('apple'),
                    'requires' => null,
                    'redirect_url' => url('/api/auth/apple/redirect'),
                    'callback_url' => config('services.apple.redirect'),
                ],
            ],
        ];
    }

    /**
     * @return array{provider: string, provider_id: string, email: ?string, name: ?string, avatar: ?string, raw: array<string, mixed>}
     */
    private function profileFromSocialite(string $provider): array
    {
        $socialUser = Socialite::driver($provider)->stateless()->user();

        return [
            'provider' => $provider,
            'provider_id' => (string) $socialUser->getId(),
            'email' => $socialUser->getEmail(),
            'name' => $socialUser->getName() ?: $socialUser->getNickname(),
            'avatar' => $socialUser->getAvatar(),
            'raw' => [
                'nickname' => $socialUser->getNickname(),
                'user' => $socialUser->user,
            ],
        ];
    }

    /**
     * @return array{provider: string, provider_id: string, email: ?string, name: ?string, avatar: ?string, raw: array<string, mixed>}
     */
    private function appleProfileFromCallback(Request $request): array
    {
        $code = $request->string('code')->toString();

        if ($code === '') {
            throw new RuntimeException('A Apple não devolveu um código de autorização válido.');
        }

        $tokenResponse = Http::asForm()->post('https://appleid.apple.com/auth/token', [
            'client_id' => config('services.apple.client_id'),
            'client_secret' => $this->appleClientSecret(),
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => config('services.apple.redirect'),
        ]);

        if (! $tokenResponse->successful()) {
            throw new RuntimeException('Não foi possível validar a resposta da Apple. Confirma as credenciais e o callback URL.');
        }

        $tokenPayload = $tokenResponse->json();
        $idToken = $tokenPayload['id_token'] ?? null;

        if (! is_string($idToken) || $idToken === '') {
            throw new RuntimeException('A Apple não devolveu um token de identidade válido.');
        }

        $claims = $this->verifiedAppleClaims($idToken);
        $providerId = (string) ($claims['sub'] ?? '');

        if ($providerId === '') {
            throw new RuntimeException('A Apple não devolveu um identificador de utilizador válido.');
        }

        return [
            'provider' => 'apple',
            'provider_id' => $providerId,
            'email' => isset($claims['email']) ? (string) $claims['email'] : null,
            'name' => $this->appleNameFromRequest($request),
            'avatar' => null,
            'raw' => [
                'claims' => $claims,
                'apple_user' => $this->appleUserPayload($request),
            ],
        ];
    }

    /**
     * @return array{user: User, is_new_user: bool}
     */
    private function findOrCreateUser(array $profile): array
    {
        return DB::transaction(function () use ($profile): array {
            $provider = (string) $profile['provider'];
            $providerId = (string) $profile['provider_id'];
            $email = $profile['email'] ? (string) $profile['email'] : null;
            $name = $profile['name'] ? (string) $profile['name'] : null;

            if ($providerId === '') {
                throw new RuntimeException('O provider não devolveu um identificador válido.');
            }

            $account = SocialAccount::query()
                ->where('provider', $provider)
                ->where('provider_id', $providerId)
                ->first();

            if ($account) {
                $this->updateSocialAccount($account, $profile);

                return [
                    'user' => $account->user,
                    'is_new_user' => false,
                ];
            }

            if (! $email) {
                throw new RuntimeException('A Apple não devolveu e-mail neste pedido. Usa o mesmo Apple ID já associado ou repete o registo autorizando a partilha do e-mail.');
            }

            $user = User::query()->where('email', $email)->first();
            $isNewUser = false;

            if (! $user) {
                $isNewUser = true;
                $user = User::query()->create([
                    'name' => $this->resolveSocialName($name, $email),
                    'email' => $email,
                    'password' => Hash::make(Str::random(48)),
                    'role' => UserRole::Client->value,
                    'timezone' => config('saas.default_timezone'),
                    'email_verified_at' => now(),
                ]);
            }

            $account = SocialAccount::query()->create([
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_id' => $providerId,
                'email' => $email,
                'name' => $name ?: $user->name,
                'avatar' => $profile['avatar'] ?? null,
                'metadata' => [
                    'authenticated_with' => $provider,
                    'raw' => $profile['raw'] ?? [],
                ],
            ]);

            return [
                'user' => $account->user,
                'is_new_user' => $isNewUser,
            ];
        });
    }

    private function updateSocialAccount(SocialAccount $account, array $profile): void
    {
        $account->forceFill([
            'email' => $profile['email'] ?: $account->email,
            'name' => $profile['name'] ?: $account->name,
            'avatar' => $profile['avatar'] ?: $account->avatar,
            'metadata' => [
                'authenticated_with' => $account->provider,
                'raw' => $profile['raw'] ?? [],
            ],
        ])->save();
    }

    private function appleAuthorizationUrl(): string
    {
        return 'https://appleid.apple.com/auth/authorize?'.http_build_query([
            'client_id' => config('services.apple.client_id'),
            'redirect_uri' => config('services.apple.redirect'),
            'response_type' => 'code',
            'response_mode' => 'form_post',
            'scope' => 'name email',
        ]);
    }

    private function appleClientSecret(): string
    {
        $configuredSecret = config('services.apple.client_secret');

        if (filled($configuredSecret)) {
            return (string) $configuredSecret;
        }

        $privateKey = str_replace('\n', "\n", (string) config('services.apple.private_key'));

        return JWT::encode([
            'iss' => config('services.apple.team_id'),
            'iat' => now()->timestamp,
            'exp' => now()->addMonths(5)->timestamp,
            'aud' => 'https://appleid.apple.com',
            'sub' => config('services.apple.client_id'),
        ], $privateKey, 'ES256', (string) config('services.apple.key_id'));
    }

    /**
     * @return array<string, mixed>
     */
    private function verifiedAppleClaims(string $idToken): array
    {
        $jwks = Http::get('https://appleid.apple.com/auth/keys')->throw()->json();
        $claims = (array) JWT::decode($idToken, JWK::parseKeySet($jwks));

        if (($claims['iss'] ?? null) !== 'https://appleid.apple.com') {
            throw new RuntimeException('O token devolvido pela Apple tem um emissor inválido.');
        }

        if (($claims['aud'] ?? null) !== config('services.apple.client_id')) {
            throw new RuntimeException('O token devolvido pela Apple não pertence a esta aplicação.');
        }

        return $claims;
    }

    private function appleNameFromRequest(Request $request): ?string
    {
        $payload = $this->appleUserPayload($request);
        $name = $payload['name'] ?? null;

        if (! is_array($name)) {
            return null;
        }

        $parts = array_filter([
            $name['firstName'] ?? null,
            $name['lastName'] ?? null,
        ]);

        return $parts === [] ? null : implode(' ', $parts);
    }

    /**
     * @return array<string, mixed>
     */
    private function appleUserPayload(Request $request): array
    {
        $user = $request->input('user');

        if (! is_string($user) || $user === '') {
            return [];
        }

        $decoded = json_decode($user, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function resolveSocialName(?string $name, string $email): string
    {
        return $name
            ?: Str::headline(Str::before($email, '@'))
            ?: 'Cliente BarberBook';
    }

    private function isSupportedProvider(string $provider): bool
    {
        return in_array($provider, self::PROVIDERS, true);
    }

    private function missingConfiguration(string $provider): ?string
    {
        $required = match ($provider) {
            'google' => [
                'GOOGLE_CLIENT_ID' => config('services.google.client_id'),
                'GOOGLE_CLIENT_SECRET' => config('services.google.client_secret'),
                'GOOGLE_REDIRECT_URI' => config('services.google.redirect'),
            ],
            'apple' => [
                'APPLE_CLIENT_ID' => config('services.apple.client_id'),
                'APPLE_REDIRECT_URI' => config('services.apple.redirect'),
            ] + (filled(config('services.apple.client_secret')) ? [] : [
                'APPLE_TEAM_ID' => config('services.apple.team_id'),
                'APPLE_KEY_ID' => config('services.apple.key_id'),
                'APPLE_PRIVATE_KEY' => config('services.apple.private_key'),
            ]),
            default => [],
        };

        $missing = array_keys(array_filter($required, fn ($value) => blank($value)));

        if ($missing === []) {
            return null;
        }

        return 'Faltam variáveis de ambiente OAuth: '.implode(', ', $missing).'.';
    }

    private function redirectWithError(string $message): RedirectResponse
    {
        return redirect()->away($this->frontendCallbackUrl([
            'error' => $message,
        ]));
    }

    private function frontendCallbackUrl(array $query): string
    {
        return rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/')
            .'/auth/social-callback?'.http_build_query($query);
    }
}
