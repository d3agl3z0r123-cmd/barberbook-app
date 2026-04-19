# BarberPro

Base inicial de um SaaS para barbearias, criada com Next.js, TypeScript e Tailwind CSS.

## O que ja esta pronto

- landing page com posicionamento de produto
- dashboard inicial com metricas e agenda mockada
- estrutura visual pronta para evoluir para app real
- modelo SQL inicial multi-tenant para varias barbearias
- `.env.example` com servicos pensados para Supabase e Stripe

## Stack sugerida

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase para auth e banco
- Stripe para assinatura recorrente

## Como rodar

```bash
npm install
npm run dev
```

## Estrutura

- `app/` paginas da landing e dashboard
- `lib/mock-data.ts` dados fake para acelerar prototipo
- `docs/schema.sql` modelagem inicial do banco

## Proximos passos recomendados

1. Conectar Supabase para login e persistencia real.
2. Implementar cadastro de barbearia no onboarding.
3. Criar CRUD de barbeiros, servicos e clientes.
4. Liberar agendamento publico por link da unidade.
5. Integrar assinatura mensal com Stripe ou Mercado Pago.
