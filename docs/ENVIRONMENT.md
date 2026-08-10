# Environment Variables

Todas as env vars usadas pelo Vertiplay. Algumas são obrigatórias, outras opcionais.

## Dev local: `.env.local`

Criar na raiz. Nunca commitar (`.gitignore` já cuida).

## Prod: Vercel

Configurar via `vercel env add NOME production` (CLI) ou Dashboard → Project → Settings → Environment Variables. Marcar como *Sensitive* para credenciais.

---

## Core

### `DATABASE_URL` *(obrigatória)*
String de conexão Postgres.

- **Dev:** `postgresql://user:pass@localhost:5432/vertiplay`
- **Prod:** pooler do Supabase (`vertiplay-us`, porta 6543). Ver `DIRECT_URL` abaixo para migrations.

### `DIRECT_URL` *(obrigatória)*
Conexão direta ao Postgres (porta 5432, sem pgbouncer) — usada só por `prisma db push`/migrations. Mesmo host do pooler Supabase, porta diferente.

### `NEXTAUTH_SECRET` *(obrigatória)*
Random secret para assinar JWT. Gerar com `openssl rand -base64 32`.

### `NEXTAUTH_URL`
Base URL do app. Dev: `http://localhost:3030`. Prod: `https://mvp.vertiplay.com.br`.

(NextAuth v5 muitas vezes deduz isso do request, mas é bom setar explícito.)

### `NEXT_PUBLIC_APP_URL`
URL pública exposta ao client. Usada em links absolutos.

### `NEXT_PUBLIC_APP_NAME`
`Vertiplay`. Usado em metadata.

### `NODE_ENV`
`production` em prod, `development` em dev. Setado pelo Next.

### `NEXT_TELEMETRY_DISABLED`
`1` em prod pra desligar telemetria do Next.

---

## Google OAuth

### `GOOGLE_CLIENT_ID` *(obrigatória pra Google login web)*
Client ID do tipo **Web application** no Google Cloud Console.

### `GOOGLE_CLIENT_SECRET` *(obrigatória)*
Secret correspondente.

### `GOOGLE_IOS_CLIENT_ID`
Client ID do tipo **iOS** (Bundle ID: `com.diogoarchanjo.vertiplay`). Usado pra verificar idToken vindo do plugin Capacitor.

### `GOOGLE_ANDROID_CLIENT_ID`
Client ID do tipo **Android** (SHA-1 do keystore `vertiplay-release`). Usado pra verificar idToken Android.

### `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`
Mesmo valor do `GOOGLE_CLIENT_ID`, exposto ao client (necessário pro plugin nativo configurar o flow).

### `NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID`
Mesmo valor do `GOOGLE_IOS_CLIENT_ID`, exposto ao client.

---

## Email (Resend)

### `RESEND_API_KEY` *(obrigatória pra Email OTP)*
API key da Resend. Formato `re_*`.

### `RESEND_FROM_EMAIL`
Remetente. Ex: `Vertiplay <no-reply@vertiplay.com.br>`. Domínio precisa estar verificado na Resend.

---

## Stripe

### `STRIPE_SECRET_KEY` *(obrigatória pra Stripe)*
Server-side. Live: `sk_live_*`. Test: `sk_test_*`.

### `STRIPE_WEBHOOK_SECRET` *(obrigatória pro webhook)*
Secret do endpoint configurado em https://dashboard.stripe.com/webhooks. Formato `whsec_*`.

### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
Publishable key (client-side). Live: `pk_live_*`. Test: `pk_test_*`.

---

## Mercado Pago

### `MP_ACCESS_TOKEN` *(obrigatória pra MP)*
Access token da conta. Formato `APP_USR_*`.

### `MP_WEBHOOK_SECRET`
Secret HMAC do webhook. Configurado em https://www.mercadopago.com.br/developers/panel/notifications.

### `NEXT_PUBLIC_MP_PUBLIC_KEY`
Public key (client-side). Formato `APP_USR_*`.

---

## Admin

### `ADMIN_EMAILS`
CSV de emails permitidos no `/admin`. Ex: `agenciaf3xia@gmail.com,livoolivecommerce@gmail.com,outro@dominio.com`.

**Default (se não setar):** `agenciaf3xia@gmail.com,livoolivecommerce@gmail.com`.

Veja `lib/admin.ts`.

---

## Capacitor (opcional, runtime)

Plugin Social Login lê esses no client se setados. Caso contrário, usa defaults.

### `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`
Já listado acima.

### `NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID`
Já listado acima.

---

## Future (não usadas ainda, mas reservadas)

### `CLOUDFLARE_R2_ACCOUNT_ID`
### `CLOUDFLARE_R2_ACCESS_KEY_ID`
### `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
### `CLOUDFLARE_R2_BUCKET`
Pra quando integrar R2 storage de vídeos.

### `FCM_SERVER_KEY` / `APNS_KEY_ID`
Push notifications (futuro).

### `GA4_MEASUREMENT_ID` / `POSTHOG_KEY`
Analytics (futuro).

---

## Resumo: vars obrigatórias pra subir o app em prod

| Var | Por quê |
|---|---|
| `DATABASE_URL` | Postgres |
| `NEXTAUTH_SECRET` | Assinar JWT |
| `NEXTAUTH_URL` | Base URL |
| `GOOGLE_CLIENT_ID` + `_SECRET` | Login Google web |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Email OTP |
| `STRIPE_SECRET_KEY` + `_WEBHOOK_SECRET` + `_PUBLISHABLE_KEY` | Pagamentos cartão |
| `MP_ACCESS_TOKEN` + `_WEBHOOK_SECRET` + `_PUBLIC_KEY` | PIX/cartão BR |
| `ADMIN_EMAILS` | Painel admin (opcional, tem default) |

## Exemplo de `.env.local` (dev)

```bash
# Core
DATABASE_URL="postgresql://test:test@localhost:5432/vertiplay"
NEXTAUTH_SECRET="abc..."
NEXTAUTH_URL="http://localhost:3030"
NEXT_PUBLIC_APP_URL="http://localhost:3030"

# Google
GOOGLE_CLIENT_ID="123-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID="123-abc.apps.googleusercontent.com"

# Email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Vertiplay Dev <onboarding@resend.dev>"

# Stripe (test)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# MP (sandbox)
MP_ACCESS_TOKEN="TEST-..."
NEXT_PUBLIC_MP_PUBLIC_KEY="TEST-..."

# Admin
ADMIN_EMAILS="seu-email@gmail.com"
```

## Como configurar na Vercel

```bash
# Via UI: Dashboard → Project vertiplay → Settings → Environment Variables
# Via CLI:
printf '%s' "valor" | vercel env add NOME_DA_VAR production
vercel env ls
vercel env rm NOME_DA_VAR production --yes
```
