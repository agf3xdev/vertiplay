# Vertiplay

> A Netflix de novelas verticais do Brasil — short drama BR-first com **shop shoppable**, sistema social e pipeline UGC. Inspirado em ReelShort/DramaBox, nascido em PT-BR.

Produzido pela [F3X](https://github.com/agf3xdev) para Diogo Archanjo (CEO).

- **Live:** https://mvp.vertiplay.com.br
- **iOS:** TestFlight (Apple Dev: AGENCIA F3X CONSULTORIA)
- **Android:** Play Console (Internal Testing, agência F3X Tech)

## Stack

| Camada | Tech |
|---|---|
| **App web** | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind v4 |
| **Auth** | NextAuth v5 (Google OAuth + Email OTP via Resend + Google nativo Capacitor) |
| **Banco** | Postgres Managed (Supabase), Prisma 6 ORM |
| **Pagamentos** | Stripe (cartão) + Mercado Pago (PIX/cartão/boleto) — **LIVE** |
| **Vídeo** | HLS.js + MP4; produção planejada Cloudflare R2 |
| **Estado client** | Zustand + persist localStorage |
| **Mobile wrap** | Capacitor 8 (WebView que carrega `mvp.vertiplay.com.br`) |
| **Hospedagem** | Vercel |
| **Storage** | Cloudflare R2 (vídeos planejado), Unsplash CDN (placeholders) |

## Estrutura

```
vertiplay/
├── app/                      # Next.js App Router
│   ├── (rotas user-facing)   # /, /browse, /watch, /shop, /profile, /wallet...
│   ├── admin/                # Painel administrativo (gated por allowlist)
│   ├── api/                  # API routes
│   └── auth/                 # Login (Google + Email OTP)
├── components/               # UI components
│   ├── admin/                # AdminShell, PageHeader, Table, etc
│   ├── VerticalPlayer.tsx    # Player HLS estilo TikTok
│   ├── BottomNav.tsx
│   └── ShopOverlay.tsx       # Sacolinha shoppable durante o player
├── lib/                      # Business logic
│   ├── prisma.ts             # Singleton Prisma client
│   ├── catalog.ts            # Catálogo in-memory (séries mock)
│   ├── shop.ts               # Brands + Products in-memory (mock)
│   ├── store.ts              # Zustand global (wallet/cart/social)
│   ├── stripe.ts             # Stripe integration
│   ├── mercadopago.ts        # MP integration
│   ├── email.ts              # OTP via Resend
│   ├── social-store.ts       # User upsert + amizades
│   ├── admin.ts              # Gate por email allowlist
│   └── admin-api.ts          # Helpers de admin endpoints
├── prisma/
│   └── schema.prisma         # 17 modelos (User, Series, Episode, Brand, ...)
├── android/                  # Capacitor Android shell
├── ios/                      # Capacitor iOS shell
├── public/                   # Estáticos (logos, ícones)
├── Dockerfile
├── capacitor.config.ts
└── docs/                     # ← Documentação completa
    ├── ARCHITECTURE.md
    ├── STACK.md
    ├── DATA_MODEL.md
    ├── AUTH.md
    ├── PAYMENTS.md
    ├── ROUTES.md
    ├── API.md
    ├── ADMIN.md
    ├── NATIVE.md
    ├── DEPLOY.md
    └── ENVIRONMENT.md
```

## Quick start

```bash
npm install
# Configurar .env.local (ver docs/ENVIRONMENT.md)
npx prisma db push
npm run dev   # http://localhost:3030
```

## Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Next dev em :3030 |
| `npm run build` | Next build (gera `.next`) |
| `npm start` | Next start em :3030 |
| `npm run lint` | ESLint |
| `npm run db:push` | Aplica schema Prisma no banco |
| `npm run db:studio` | Prisma Studio (GUI do banco) |

## Documentação

- **[Architecture](docs/ARCHITECTURE.md)** — visão sistêmica
- **[Stack](docs/STACK.md)** — versões e deps explicadas
- **[Data Model](docs/DATA_MODEL.md)** — 17 modelos Prisma
- **[Auth](docs/AUTH.md)** — Google OAuth + Email OTP + Google nativo
- **[Payments](docs/PAYMENTS.md)** — Stripe + MP fluxos completos
- **[Routes](docs/ROUTES.md)** — todas as páginas user-facing
- **[API](docs/API.md)** — 30+ endpoints documentados
- **[Admin](docs/ADMIN.md)** — painel administrativo
- **[Native](docs/NATIVE.md)** — iOS + Android Capacitor
- **[Deploy](docs/DEPLOY.md)** — Vercel + Supabase + DNS + SSL
- **[Environment](docs/ENVIRONMENT.md)** — todas as env vars

## Mercado

| | ReelShort | DramaBox | **Vertiplay** |
|---|---|---|---|
| Player vertical | ✓ | ✓ | ✓ |
| Coins + VIP | ✓ | ✓ | ✓ |
| Daily check-in | ✓ | ✓ | ✓ |
| Conteúdo BR-first | dublado | dublado | **✓ nativo PT-BR** |
| **Shop shoppable por série** | ✗ | ✗ | **✓** |
| **Sistema social (amigos + gifts)** | ✗ | ✗ | **✓** |
| **Pipeline UGC** | ✗ | ✗ | **✓** |
| Pagamento PIX | ✗ | ✗ | **✓** |

Short drama global: **US$ 2,98 bi** IAP em 2025 (+115% YoY). ReelShort ~US$ 1,2 bi/ano. Globo lançou GloboPop = validação do mercado BR.

## Licença

Propriedade de Vertiplay. Código produzido pela F3X sob contrato. Não distribuir.
