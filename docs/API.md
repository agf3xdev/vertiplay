# API

Todos os endpoints estão em `app/api/`. Convenções:
- `GET` = lê / lista
- `POST` = cria / executa
- `PATCH` = atualiza
- `DELETE` = remove
- Endpoints `/api/admin/*` protegidos por `gate()` em `lib/admin-api.ts` (403 se não admin)

## Públicos

### `GET /api/health`
Health check pro DO. Retorna `{ ok: true, ts }`.

### `GET /api/catalog`
Catálogo público (SERIES + GENRES). Lê do `lib/catalog.ts` (mock).

### `GET /api/shop`
BRANDS + PRODUCTS do `lib/shop.ts` (mock).

## Auth

### `POST /api/auth/[...nextauth]`
Handler do NextAuth. Aceita providers: `google`, `google-native`, `email-otp`.

### `POST /api/auth/email/start`
Body: `{ email }`.

1. Gera 6 dígitos random
2. SHA-256 hash
3. Upsert em `OtpCode` (TTL 10min)
4. Resend envia email

Retorna `{ ok: true }`.

## Usuários

### `GET /api/me`
Sessão atual. Retorna `{ user: { id, email, displayName, coinsPaid, coinsBonus, isVip, ... } }` ou `401`.

### `GET /api/users/search?q=<query>`
Busca usuários por `username` ou `displayName`. Retorna até 10.

## Amizades

### `POST /api/friends/request`
Body: `{ toUsername }`. Cria `Friendship` com status pending + dispara email pro destinatário.

### `POST /api/friends/accept`
Body: `{ fromId }`. Muda status pra `"accepted"`.

### `POST /api/friends/reject`
Body: `{ fromId }`. Deleta a Friendship.

### `POST /api/friends/remove`
Body: `{ otherId }`. Deleta amizade aceita.

## Pagamentos

### `POST /api/stripe/checkout`
Body: `{ kind: "coins" | "vip" | "shop", packId?, items? }`.

Cria `checkout.session` no Stripe, retorna `{ url }`.

### `POST /api/stripe/webhook`
Recebe eventos Stripe.

1. Valida HMAC com `STRIPE_WEBHOOK_SECRET`
2. Se `checkout.session.completed`:
   - Lê metadata (userId, kind, packId)
   - Credita coins ou marca Order paid
   - Cria Transaction + LedgerEntry

### `POST /api/mp/checkout`
Body: `{ kind, items, payerEmail }`.

Cria payment PIX no MP, retorna `{ qrCode, brcode, paymentId }`.

### `POST /api/mp/webhook`
Recebe eventos MP.

1. Valida HMAC com `MP_WEBHOOK_SECRET`
2. `mp.payment.get(id)` busca detalhes
3. Se `status: "approved"`:
   - Credita coins / marca Order paid
   - LedgerEntry

## UGC

### `POST /api/stories`
Body: `{ authorName, email?, phone?, title, genre?, synopsis, inspiration?, consent }`.

Cria `StorySubmission` com `status: "pending"`. Email opcional pro admin.

## Admin (todos gated)

### Series
- `GET /api/admin/series` — lista
- `POST /api/admin/series` — cria (body: campos do Series + episodes opcionais)
- `GET /api/admin/series/:id` — detalhe
- `PATCH /api/admin/series/:id` — atualiza
- `DELETE /api/admin/series/:id` — remove (cascade Episode)

### Episodes
- `GET /api/admin/episodes?seriesId=` — lista por série
- `POST /api/admin/episodes` — cria
- `PATCH /api/admin/episodes/:id`
- `DELETE /api/admin/episodes/:id`

### Brands
- `GET /api/admin/brands`
- `POST /api/admin/brands`
- `GET /api/admin/brands/:id`
- `PATCH /api/admin/brands/:id`
- `DELETE /api/admin/brands/:id` (cascade Product)

### Products
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/:id`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

### Appearances (ProductAppearance)
- `POST /api/admin/appearances` — link product → series/episode
- `DELETE /api/admin/appearances/:id`

### Campaigns (SeriesSponsorship)
- `GET /api/admin/campaigns`
- `POST /api/admin/campaigns` — `{ brandId, seriesId, tier, startAt, endAt }`
- `PATCH /api/admin/campaigns/:id`
- `DELETE /api/admin/campaigns/:id`

### Stories (UGC review)
- `PATCH /api/admin/stories/:id` — body: `{ status: "approved" | "rejected" | "reviewing" }`

### Users
- `PATCH /api/admin/users/:id` — admin pode editar coinsPaid, coinsBonus, isVip, vipExpiresAt

### Seeds (one-shot)
- `POST /api/admin/seed-demo` — cria 1 série "Hotel das Sombras" + 10 eps + 1 marca + 3 produtos
- `POST /api/admin/seed-shop` — importa TODO o `lib/catalog.ts` + `lib/shop.ts` pro DB (12 séries, 11 marcas, ~30 produtos)

Ambos idempotentes via `upsert` por slug.

## Convenções de erro

| Código | Quando |
|---|---|
| 200 | OK |
| 201 | Criado |
| 400 | Body inválido / missing fields |
| 401 | Não autenticado |
| 403 | Autenticado mas sem permissão (admin gate) |
| 404 | Recurso não existe |
| 409 | Conflito (ex: slug duplicado) |
| 500 | Erro do servidor |

Body de erro: `{ error: "mensagem em PT-BR" }`.

## CORS

Não configurado custom. Default Next.js (same-origin). Webhooks vêm de Stripe/MP que não precisam CORS (servidor → servidor).

## Rate limiting

Não implementado. Próximo passo: middleware com `@upstash/ratelimit` ou custom em memória.

## Versionamento

Sem versionamento (sem `/v1/`). Endpoints são considerados beta. Mudar interface = update simultâneo do client.
