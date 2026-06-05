# Auth

NextAuth v5 (Auth.js) com 3 providers. Sessões JWT (sem PrismaAdapter — `User` no DB populado via `upsertUser()` em `lib/social-store.ts`).

Configuração: `auth.ts` (root).

## Providers

### 1. Google OAuth (web)

```ts
Google({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: { params: { prompt: "select_account" } },
  checks: ["state"],  // SEM PKCE
})
```

**Por que sem PKCE:** Cloudflare proxy entre cliente e DO mexe nos cookies durante o handshake; o PKCE verifier cookie pode chegar quebrado, retornando `unexpected "state" response parameter value`. `checks: ["state"]` mantém CSRF mas pula PKCE.

**Por que `useSecureCookies: true`:** força prefix `__Secure-` (anti-MITM em prod).

**Limitação Test Mode (Google Cloud):** Console "Vertiplay" tá em modo *Testing*. Só emails listados em *Test users* conseguem logar. Pra liberar: publicar app no Google ou usar Email OTP como workaround.

### 2. Google nativo (Capacitor)

Usado dentro do app mobile. WebView não pode abrir browser externo confiável → `@capgo/capacitor-social-login` plugin abre o flow nativo, devolve `idToken`, e a gente valida no server:

```ts
Credentials({
  id: "google-native",
  async authorize({ idToken }) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: [
        process.env.GOOGLE_CLIENT_ID,        // web
        process.env.GOOGLE_IOS_CLIENT_ID,    // iOS
        process.env.GOOGLE_ANDROID_CLIENT_ID // Android
      ],
    });
    const payload = ticket.getPayload();
    // valida email_verified, upsertUser, retorna session
  }
})
```

**Frontend** detecta Capacitor (`window.Capacitor?.isNativePlatform()`) e usa o plugin em vez de redirect web. Ver `lib/native-auth.ts` e `app/auth/page.tsx`.

**3 OAuth Client IDs no Google Console:**
- Web (mvp.vertiplay.com.br)
- iOS (bundle `com.diogoarchanjo.vertiplay`)
- Android (SHA-1 do keystore `vertiplay-release`)

### 3. Email OTP (Resend)

Fluxo:

```
1. POST /api/auth/email/start { email }
   → server: gera 6 dígitos random
   → SHA-256(code) → upsert em OtpCode (TTL 10min, maxAttempts 5)
   → Resend envia email com template
2. Cliente: POST /api/auth/callback/email-otp { email, code }
   → NextAuth Credentials provider: verifyOtp(email, code)
   → se ok: upsertUser + retorna session
```

Implementação:
- `lib/email.ts` — `sendOtp()`, `verifyOtp()`
- `app/api/auth/email/start/route.ts` — endpoint
- Provider `email-otp` em `auth.ts`

**Anti-abuse:** rate limit por email implícito (upsert em OtpCode com mesma key + TTL).

## Sessão

JWT no cookie `__Secure-authjs.session-token` (prod) ou `authjs.session-token` (dev).

Payload mínimo: `{ id, email, name, image }`.

`auth()` (importado de `auth.ts`) é o helper Server Component:

```ts
const session = await auth();
if (!session?.user?.email) redirect("/auth");
```

## Admin gate

`lib/admin.ts`:

```ts
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "agenciaf3xia@gmail.com,livoolivecommerce@gmail.com")
    .split(",").map(s => s.trim().toLowerCase());
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
```

Usado em:
- `app/admin/layout.tsx` — server gate; redireciona se não logado, mostra "Acesso restrito" se logado mas não admin
- `lib/admin-api.ts` `gate()` — 403 em endpoints `/api/admin/*`

**Default fallback** (não precisa de env):
- `agenciaf3xia@gmail.com`
- `livoolivecommerce@gmail.com`

## Fluxo cold-start

```
Usuário não logado em /watch/:slug/:ep
  → middleware (futuro, ainda inexistente) ou page redirect
  → /auth?callbackUrl=/watch/...
  → escolhe Google ou Email OTP
  → callback → JWT cookie setado
  → redirect callbackUrl
```

## Vulnerabilidades conhecidas

- **Replay de OTP:** se atacante intercepta email antes do user, pode usar. Mitigado por TTL curto (10min) + maxAttempts 5 + email transit TLS via Resend.
- **CSRF em Email OTP:** `state` check do NextAuth não se aplica a Credentials provider. Mitigado por exigir email + code que só o dono do email recebe.
- **Token sequestration:** JWT no cookie. Mitigado por `useSecureCookies` (HTTPS-only) + `httpOnly` (NextAuth default).

## Arquivos relacionados

- `auth.ts` — config NextAuth
- `auth.config.ts` — config sem Prisma (legacy, pode remover)
- `app/api/auth/[...nextauth]/route.ts` — handler
- `app/api/auth/email/start/route.ts` — endpoint OTP start
- `app/auth/page.tsx` — UI de login
- `lib/email.ts` — Resend + OTP logic
- `lib/native-auth.ts` — runtime config do plugin Capacitor
- `lib/social-store.ts` — upsertUser
- `lib/admin.ts` — admin gate
