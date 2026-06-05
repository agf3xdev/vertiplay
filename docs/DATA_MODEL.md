# Data Model

Schema: `prisma/schema.prisma` (Postgres, Prisma 6).

17 modelos divididos em 5 grupos: **Identidade/Social**, **Conteúdo**, **Wallet/Engajamento**, **Shop**, **UGC**.

## Identidade & Social

### User
Principal entidade. Inclui wallet (coins) e flags VIP.

| Campo | Tipo | Notas |
|---|---|---|
| id | String @id @default(cuid()) | |
| username | String @unique | @arroba para busca/amigos |
| displayName | String @default("") | |
| email | String @unique | |
| name | String? | |
| avatarUrl | String? | |
| bio | String? | |
| **coinsPaid** | Int @default(0) | Compradas (gastas primeiro) |
| **coinsBonus** | Int @default(50) | Rewards/check-in (50 de boas-vindas) |
| isVip | Boolean @default(false) | |
| vipExpiresAt | DateTime? | |
| createdAt / updatedAt / lastSeenAt | DateTime | |

**Lógica de coins:** consumir `coinsPaid` primeiro, depois `coinsBonus` (regra ReelShort/DramaBox para incentivar compras).

### Friendship
Modelo direcional: `from → to`. Status `"pending"` até accept.

| Campo | Notas |
|---|---|
| fromId / toId | FK → User |
| status | `"pending"` \| `"accepted"` |

Constraint: `@@unique([fromId, toId])`.

### OtpCode
Códigos de login por email.

| Campo | Notas |
|---|---|
| email | @unique (1 código ativo por email, upsert) |
| codeHash | SHA-256 (nunca armazenar plain) |
| expiresAt | TTL 10min |
| attempts | Max 5 |

## Conteúdo

### Series
12 séries mock no `lib/catalog.ts`; admin pode criar/editar via `/admin/series`.

| Campo | Tipo | Notas |
|---|---|---|
| slug | String @unique | URL friendly |
| title / synopsis | String | |
| posterUrl / bannerUrl | String / String? | |
| genre | String | "Bilionário", "Lobisomem", "Máfia", "CEO", "Amor Proibido"... |
| tags | String | CSV de tags |
| language | String @default("pt-BR") | |
| isDubbed | Boolean @default(true) | |
| views / rating | Int / Float | |
| totalEpisodes / freeEpisodes | Int / Int @default(3) | |
| isFeatured / isExclusive | Boolean | |
| releaseAt / createdAt | DateTime | |

### Episode
Episódios linkados à série, numerados 1..N.

| Campo | Notas |
|---|---|
| seriesId | FK → Series, cascade delete |
| number | Int |
| title / videoUrl / thumbUrl | String |
| durationSec | Int (60-90s típico) |
| costCoins | Int @default(20) |
| isFree | Boolean @default(false) |

Constraint: `@@unique([seriesId, number])`.

### Unlock
Registra qual usuário desbloqueou qual episódio.

| Campo | Notas |
|---|---|
| userId / episodeId | FK |
| coinsSpent | Int |

Constraint: `@@unique([userId, episodeId])`.

### WatchProgress
Posição do player (resume).

| Campo | Notas |
|---|---|
| positionSec | Int |
| completed | Boolean |

### Watchlist
Lista de séries salvas pelo usuário.

## Wallet / Engajamento

### Checkin
Daily check-in (anti-double-claim por dia).

| Campo | Notas |
|---|---|
| day | String "YYYY-MM-DD" |
| reward | Int (escala: 10, 15, 20, 30, 40, 60, 100 nos 7 dias) |

Constraint: `@@unique([userId, day])`.

### Transaction
Log financeiro do usuário. Kinds: `"purchase"`, `"unlock"`, `"checkin"`, `"bonus"`, `"vip"`, `"shop"`.

### LedgerEntry
Audit trail de pagamentos (Stripe + MP).

| Campo | Notas |
|---|---|
| source | `"stripe"` \| `"mp"` |
| type | `"payment"` \| `"ignored"` \| `"error"` \| `"signature_invalid"` |
| paymentId | ID do gateway |
| meta | Json (payload completo do webhook) |

## Shop (B2B2C diferencial)

### Brand
Marcas patrocinadoras.

| Campo | Notas |
|---|---|
| slug | @unique |
| name / logoUrl / coverUrl | |
| bio | Texto da marca |
| website | URL externa |
| category | "Moda" \| "Casa" \| "Beleza" \| "Eletro" \| "Joias" \| ... |
| isVerified | Boolean (selo azul) |

### Product
Itens shoppable.

| Campo | Notas |
|---|---|
| brandId | FK → Brand, cascade |
| slug | @unique |
| name / description / imageUrl | |
| gallery | CSV de URLs extras |
| priceBRL / oldPriceBRL | Int (centavos) |
| stock / rating | Int / Float |
| affiliateUrl | URL externa opcional |

### ProductAppearance
"Tal produto aparece na série X, episódio Y" — alimenta a sacolinha do player.

| Campo | Notas |
|---|---|
| productId | FK |
| seriesId | String (não FK — pode referenciar mocks in-memory) |
| episodeId | String? (NULL = vários eps) |
| sceneNote | "Vestido da Helena no jantar" |
| timestampSec | Int? (cue point opcional) |

### SeriesSponsorship
Patrocínio comercial: 1 marca patrocina 1 série.

| Campo | Notas |
|---|---|
| brandId / seriesId | |
| tier | `"headline"` \| `"standard"` |
| startAt / endAt | |

Constraint: `@@unique([brandId, seriesId])`.

### CartItem
Carrinho ativo do usuário.

Constraint: `@@unique([userId, productId])`.

### Order
Pedido confirmado.

| Campo | Notas |
|---|---|
| totalBRL | Int (centavos) |
| status | `"pending"` \| `"paid"` \| `"shipped"` \| `"delivered"` |
| paymentRef | ID Stripe/MP |
| addressJson | JSON com endereço |

### OrderItem
Item de pedido (snapshot — guarda `brandSlug` e `productName` mesmo se Product for deletado).

## UGC

### StorySubmission
Pipeline "Conte sua história" do banner UGC.

| Campo | Notas |
|---|---|
| authorName / email / phone | Contato |
| title / synopsis / inspiration | Conteúdo |
| genre | Sugestão |
| consent | Boolean (permissão de uso) |
| status | `"pending"` \| `"reviewing"` \| `"approved"` \| `"rejected"` |

Admin processa em `/admin/stories`.

## Cascades

Todos os FKs principais têm `onDelete: Cascade` (deletar User remove Friendships, Unlocks, Watchlist, Transactions; deletar Series remove Episodes, Sponsorships; etc).

Exceção: `OrderItem.product` é `Restrict` (default) — snapshot preserva nome/preço mesmo se produto sumir.

## Migrações

Atualmente: `prisma db push --accept-data-loss` no boot (Dockerfile). Quando schema estabilizar, migrar pra:

```bash
npx prisma migrate dev --name <nome>   # cria migration
npx prisma migrate deploy              # aplica em prod
```
