# Stack

## Runtime
- **Node.js 22 alpine** (Docker base image)
- **TypeScript 5.7.3** (strict mode)

## Framework
- **Next.js 15.1.4** — App Router, RSC, Server Actions, route handlers
- **React 19.0.0** — RSC + transition hooks
- **react-dom 19.0.0**

## Estilização
- **Tailwind v4.0.0-beta.7** — usando `@tailwindcss/postcss`
- Tema CSS custom em `app/globals.css` com variáveis `--color-vp-*`
- `clsx 2.1.1` + helper `lib/cn.ts` para classes condicionais
- **Lucide React 0.469.0** — ícones (otimizado via `experimental.optimizePackageImports`)

## Estado client
- **Zustand 5.0.2** + middleware `persist` (localStorage)
- Hook `useStore()` em `lib/store.ts`

## Banco
- **Prisma 6.1.0** ORM + `@prisma/client`
- **Postgres** (DigitalOcean Managed Database)
- 17 modelos (ver `docs/DATA_MODEL.md`)

## Autenticação
- **NextAuth v5.0.0-beta.25** (Auth.js)
- **google-auth-library 10.6.2** — verifica idToken vindo do Capacitor
- 3 providers:
  - Google OAuth (provider built-in)
  - Credentials `google-native` (idToken via Capacitor plugin)
  - Credentials `email-otp` (código 6 dígitos via Resend)

## Email
- **Resend 6.12.3** — transactional email
  - OTP de login
  - Notificações de friend request

## Pagamentos
- **Stripe 17.7.0** (Node SDK) + client `@stripe/stripe-js` (carregado dinamicamente)
- **mercadopago 2.13.0** — PIX + cartão + boleto

## Vídeo
- **hls.js 1.5.18** — HLS.js para streaming adaptativo
- Suporta MP4 direto também (fallback)

## Mobile wrap
- **@capacitor/core 8.3.4** + cli + ios + android
- **@capgo/capacitor-social-login 8.3.22** — Google Sign-In nativo (idToken)
- Estratégia: WebView aponta pra `https://mvp.vertiplay.com.br`. Updates de app web não precisam rebuild nativo.

## Dev tooling
- **prisma 6.1.0** (CLI)
- **tsx 4.19.2** — runtime TS pra `prisma/seed.ts`
- **autoprefixer 10.4.20**, **postcss 8.4.49**
- `@types/node`, `@types/react`, `@types/react-dom`

## Build
- **Docker multi-stage** (`Dockerfile`):
  1. `deps` — `npm install`
  2. `builder` — `npx prisma generate || true` + `npm run build`
  3. `runner` — copy `.next/`, `public/`, `node_modules/`, `package.json`, `prisma/`
- **Boot CMD**: `npx prisma db push --accept-data-loss --skip-generate && exec npx next start -p 3030`
- Usuário não-root (`nextjs:1001`) por segurança

## Versões críticas (não mexer sem testar)

| Pacote | Versão | Por quê |
|---|---|---|
| next-auth | `5.0.0-beta.25` | v5 está em beta. Upgrade pra GA pode quebrar config |
| tailwindcss | `4.0.0-beta.7` | v4 ainda beta, usa `@tailwindcss/postcss` em vez de `tailwind.config.js` |
| @capacitor/* | `^8.3.4` | Capacitor 9 ainda não testado com plugin Social Login |
| prisma | `^6.1.0` | v6 mudou o cliente; downgrade quebra schema |
| react | `19.0.0` | RSC + transitions; Next 15 requer ≥18.3 |

## Pacotes notáveis ausentes (decisões conscientes)

- **Sem Tailwind config file** — v4 lê config do CSS (`@theme` directives em globals.css)
- **Sem ESLint setup customizado** — `next lint` usa o default Next.js
- **Sem Jest / Playwright** — sem testes automatizados ainda (MVP)
- **Sem React Query / SWR** — server components fazem fetch direto, client usa fetch nativo
- **Sem PrismaAdapter pro NextAuth** — sessões em JWT (cookie). `User` no DB é populado via `upsertUser()` em `lib/social-store.ts`.
