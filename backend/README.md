# BarberPro Backend

Backend Laravel para um SaaS de gestao de barbearias multi-tenant, pensado para producao e com datas guardadas em UTC.

## Principios do projeto

- Timezone de apresentacao: `Atlantic/Azores`
- Armazenamento de datas: UTC (`timestampTz`)
- Multi-tenant por `barbershop_id`
- Auth por `Laravel Sanctum`
- API REST pronta para consumo por frontend web/mobile
- Estrutura preparada para Stripe, WhatsApp, reviews e cupoes

## Stack

- Laravel 13.x no `composer.json`
- PostgreSQL como opcao recomendada
- Carbon para toda a logica temporal
- Frontend sugerido: Inertia + Vue ou o frontend Next.js ja existente no repo

## Estrutura principal

- `app/Models`: dominio SaaS
- `app/Services/AvailabilityService.php`: gera slots respeitando horario, duracao e conflitos
- `app/Services/AppointmentConflictService.php`: bloqueia sobreposicoes
- `routes/api.php`: areas `admin`, `owner`, `client` e `public`
- `database/migrations`: schema inicial do MVP
- `database/seeders/DatabaseSeeder.php`: tenant demo nos Acores

## Fluxo de agendamento

1. O frontend envia `starts_at_local` no timezone da barbearia.
2. O backend converte para UTC com Carbon.
3. O sistema calcula `ends_at` pela duracao do servico.
4. `AppointmentConflictService` impede sobreposicao para o mesmo barbeiro.
5. A resposta devolve timestamps em UTC e em `Atlantic/Azores`.

## Arranque local

Este ambiente nao tem `php` nem `composer`, por isso deixei a base do projeto pronta para instalar.

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/public/barbershops`
- `GET /api/public/barbershops/{slug}`
- `GET /api/public/barbershops/{slug}/availability`
- `GET /api/admin/dashboard`
- `GET /api/owner/barbershops/{barbershop}/dashboard`
- `POST /api/owner/barbershops/{barbershop}/appointments`
- `POST /api/client/appointments`

## Proximos passos recomendados

1. Instalar Laravel oficialmente com `composer create-project` e fundir esta estrutura no bootstrap completo.
2. Adicionar policies e middleware para tenancy/roles.
3. Implementar notificacoes por email e webhook WhatsApp.
4. Integrar cobranca Stripe com estados de subscricao.
5. Ligar o frontend atual ou migrar para Inertia + Vue dentro do Laravel.
