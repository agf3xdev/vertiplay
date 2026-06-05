# Architecture

## Visão sistêmica

```
┌─────────────────────────────────────────────────────────────────┐
│                       Usuário final                              │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │  Browser │    │  iOS App │    │ Android  │                  │
│  │  (PWA)   │    │ (TF/AS)  │    │  (Play)  │                  │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘                  │
│       │               │                │                         │
│       │      ┌────────┴────────────────┘                        │
│       │      │ Capacitor 8 WebView (URL = produção)             │
│       └──────┤                                                   │
└──────────────┼──────────────────────────────────────────────────┘
               │ HTTPS (Cloudflare → DO Edge)
               ▼
┌─────────────────────────────────────────────────────────────────┐
│              mvp.vertiplay.com.br                                │
│              DigitalOcean App Platform                           │
│              (Docker, Node 22-alpine, port 3030)                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Next.js 15 (App Router)                    │    │
│  │                                                          │    │
│  │  Server Components ── Client Components ── API routes   │    │
│  │       │                    │                  │         │    │
│  │       │  ┌─────────────────┴──────────────────┘         │    │
│  │       │  │                                              │    │
│  │       ▼  ▼                                              │    │
│  │   ┌───────────────┐   ┌──────────────────────┐         │    │
│  │   │ Prisma Client │   │ External services     │         │    │
│  │   └──────┬────────┘   │ - Stripe              │         │    │
│  │          │             │ - Mercado Pago        │         │    │
│  │          │             │ - Google OAuth        │         │    │
│  │          │             │ - Resend (email OTP)  │         │    │
│  │          │             │ - Cloudflare R2       │         │    │
│  │          ▼             └──────────────────────┘         │    │
│  └─────────┼───────────────────────────────────────────────┘    │
│            │                                                     │
└────────────┼─────────────────────────────────────────────────────┘
             │ TCP/SSL (privado, attach DO)
             ▼
       ┌──────────────────────────┐
       │  Postgres Managed DO     │
       │  cluster: vertiplay-db   │
       │  NYC3, $15.15/mês        │
       └──────────────────────────┘
```

## Decisões arquiteturais

### 1. PWA via WebView (Capacitor) em vez de React Native

**Por quê:** Time pequeno (F3X), MVP em 30 dias. Atualizar feature = git push, sem novo build de IPA/APK. Apple/Google só aprovam updates de versão quando muda config nativa (URL scheme, ícone, capabilities).

**Trade-off aceito:** UX nativa pior (animações via web, scroll com momentum web). Aceitável pra short drama (consumo passivo, não jogos/3D).

### 2. Static catalog (`lib/catalog.ts` + `lib/shop.ts`) coexistindo com Prisma

O app **user-facing** lê BRANDS/PRODUCTS/SERIES de arquivos TypeScript estáticos. O **admin** lê e escreve no Postgres via Prisma.

**Por quê:** Acelera MVP (sem CMS). Quando o admin estiver populado e a equipe quiser tornar a edição refletida no app, basta trocar imports `from "@/lib/shop"` por queries Prisma. Endpoint `/api/admin/seed-shop` já carrega o catalog estático no DB.

**Migração futura:** Ver "Caminho de migração para DB-driven" em `docs/ROADMAP_DOCS.md` (não criado ainda).

### 3. NextAuth v5 com `useSecureCookies: true` + cookie de state

Cloudflare proxy entre cliente e DO quebra cookies de PKCE durante o handshake OAuth. Solução: `checks: ["state"]` (sem PKCE) + `useSecureCookies` força `__Secure-` prefix.

### 4. Postgres com `prisma db push --accept-data-loss` no boot

`Dockerfile` roda `npx prisma db push` no entry. Estratégia válida pra MVP (schema evolui rápido). Quando estabilizar, migrar pra `prisma migrate deploy` com migrations versionadas.

### 5. Ledger genérico (`LedgerEntry`) para Stripe + MP

Em vez de uma tabela por gateway, um `LedgerEntry` com `source: "stripe" | "mp"` e `meta: Json`. Facilita auditoria, troubleshooting e queries cross-gateway.

### 6. Admin gate por allowlist (env `ADMIN_EMAILS`) — não por role no DB

`lib/admin.ts` faz lookup direto no env. Adicionar admin = editar env + redeploy. Suficiente pra equipe de 2-3 pessoas. Se virar 10+, migrar pra `User.role` no schema.

## Camadas

### Apresentação
- Server Components (default) — fazem queries Prisma direto
- Client Components (`"use client"`) — interatividade, player HLS, formulários
- `RootShell.tsx` decide se renderiza `mobile-frame` (480px container) ou full-width (admin)

### Lógica de domínio
- `lib/*.ts` — pure functions + service objects
- `prisma.ts` singleton previne connection pool leak no dev

### Persistência
- **Postgres** (Prisma): users, séries DB, brands DB, products DB, friendships, OTPs, transactions, ledger, stories UGC, orders
- **LocalStorage** (Zustand persist): wallet, unlocks, cart, watchlist do device
- **In-memory** (TypeScript estático): SERIES, BRANDS, PRODUCTS de exemplo

### Auth
- JWT sessions (sem PrismaAdapter — sessão fica no cookie)
- 3 providers: Google OAuth (web), Google nativo (Capacitor via idToken), Email OTP (6 dígitos via Resend)

### Pagamentos
- Stripe: `loadStripe` no client → checkout session no server → webhook
- Mercado Pago: cria preference server-side → redirect → webhook valida HMAC

### Mobile
- Capacitor 8 wrap. URL no `capacitor.config.ts` aponta pra produção. App nativo é só um WebView com plugin de Social Login (`@capgo/capacitor-social-login`) pra Google nativo.

## Fluxos críticos

### 1. Login Email OTP
```
1. POST /api/auth/email/start { email }
2. Server: gera código 6 dígitos, SHA-256 → upsert em OtpCode (TTL 10min)
3. Resend envia email
4. Cliente: POST /api/auth/callback/email-otp { email, code }
5. NextAuth Credentials provider valida via verifyOtp()
6. JWT session + upsertUser no DB
```

### 2. Unlock de episódio
```
1. Usuário no /watch → scroll passa do 3º ep grátis
2. Client checa store.coinsPaid + coinsBonus ≥ 20
3. Se sim, debita local + cria Unlock no DB (via API futura)
4. Se não, abre paywall → WalletPage → comprar coins (Stripe/MP)
5. Webhook bate → credita coins no User + Transaction
```

### 3. Compra shoppable (player)
```
1. ShopOverlay durante o player mostra products via productsInEpisode()
2. Cliente: addToCart() em Zustand
3. /cart → /checkout → /api/stripe/checkout ou /api/mp/checkout
4. Stripe/MP devolve sessionUrl
5. Cliente redireciona
6. Webhook cria Order + OrderItem
```

### 4. Sistema social
```
1. /friends → busca por @username via /api/users/search
2. POST /api/friends/request { toUsername }
3. Email notification via Resend ("X te adicionou")
4. POST /api/friends/accept { fromId } → Friendship.status = "accepted"
5. Now: pode presentear (gifts) ou ver watch progress
```

## Observabilidade

- `/api/health` → DO health check (port 3030)
- Logs: DO Runtime Logs (stdout/stderr)
- LedgerEntry serve como audit trail de pagamentos

## Pontos de extensão

- **R2 storage**: pronto pra trocar mocks de Unsplash por vídeos próprios. `next.config.mjs` já tem `*.r2.cloudflarestorage.com` como remote pattern.
- **CMS**: admin já tem CRUD completo, falta só "publicar" (botão que copia DB → static cache pro user-facing app).
- **Push notifications**: stub no Capacitor, falta provider (FCM/APNs).
- **Analytics**: nenhum integrado. GA4/Posthog são plug-and-play.
