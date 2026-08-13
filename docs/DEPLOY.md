# Deploy

**Migrado de DigitalOcean pra Vercel em 2026-08-10** — a conta DO que hospedava o app foi perdida. Como era MVP sem usuário real pagando, subimos do zero em infra gerenciada, sem restore de dados.

## Vercel

- **Projeto:** `livoo-projetos/vertiplay` (conta `agenciaf3xia`, mesma da Ingoo/Amigão/Primus)
- **Live:** https://mvp.vertiplay.com.br
- **Git:** conectado a `github.com/agf3xdev/vertiplay` branch `main` — todo push faz deploy automático
- **Framework:** detectado como Next.js (build `next build`, sem Dockerfile — removido junto com `.do/app.yaml` e `docker-compose.yml`, que eram só pro droplet DO)

### Variáveis de ambiente (Production)

Configuradas via `vercel env add` (a maioria como *Sensitive* — write-only, não dá pra reler depois de criada):

| Var | Origem |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Supabase `vertiplay-us` (pooler + direto). `DATABASE_URL` **precisa** de `?pgbouncer=true` — sem isso o Prisma quebra com `prepared statement already exists` no PgBouncer em transaction mode |
| `NEXT_PUBLIC_APP_URL` / `NEXTAUTH_URL` | `https://mvp.vertiplay.com.br` |
| `NEXT_PUBLIC_APP_NAME` | `Vertiplay` |
| `ADMIN_EMAILS` | `agenciaf3xia@gmail.com,livoolivecommerce@gmail.com` |
| `NEXTAUTH_SECRET` | gerado na config original (mantido) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud Console, projeto "Vertiplay" (mantido da config original) |
| `STRIPE_WEBHOOK_SECRET`, `MP_WEBHOOK_SECRET`, `NEXT_PUBLIC_MP_PUBLIC_KEY` | mantidos da config original |
| `RESEND_API_KEY` / `EMAIL_FROM` | reconfigurado em 2026-08-13, domínio `vertiplay.com.br` verificado no Resend (DKIM/SPF/MX/DMARC no Registro.br). Chave em `~/.vertiplay-resend.env` |
| `STRIPE_SECRET_KEY` | **faltando** — pegar no dashboard Stripe e rodar `vercel env add STRIPE_SECRET_KEY production` |
| `MERCADOPAGO_ACCESS_TOKEN` | **faltando** — pegar no dashboard Mercado Pago e rodar `vercel env add MERCADOPAGO_ACCESS_TOKEN production` |
| `GOOGLE_IOS_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID` | **faltando** — só bloqueia login Google nativo no Capacitor, não o web |

Ver local: `~/.vertiplay-supabase.env` (credenciais do banco). Não existe `.env.local` de produção — tudo vive só nas envs da Vercel.

### Deploy manual (fora do git push)

```bash
cd ~/projetos/vertiplay
vercel --prod
```

### Comandos úteis

```bash
vercel env ls                          # listar env vars
vercel env add NOME production         # adicionar (lê da stdin ou prompt)
vercel env rm NOME production --yes    # remover
vercel logs <deployment-url>           # runtime logs
vercel ls vertiplay                    # histórico de deployments
```

## Postgres — Supabase

- **Projeto:** `vertiplay-us` (ref `ezreisgjabvawlataugp`), região `us-east-1`, org `agenciaf3xia@gmail.com's Org`
- **Prisma:** `DATABASE_URL` usa o pooler (porta 6543, transaction mode) pra runtime; `DIRECT_URL` usa porta 5432 pra `prisma db push`/migrations
- Schema aplicado com `npx prisma db push` (sem migrations formais ainda — mesma filosofia MVP de antes)

### Aplicar mudança de schema

```bash
cd ~/projetos/vertiplay
set -a; source ~/.vertiplay-supabase.env; set +a
npx prisma db push
```

## Domínio

Domínio: `vertiplay.com.br`, DNS gerenciado no Registro.br (`a.auto.dns.br` / `b.auto.dns.br`).

**Pendente:** trocar o CNAME `mvp` de `vertiplay-mozsm.ondigitalocean.app` (DO, morto) pra `cname.vercel-dns.com` (Vercel), e adicionar o domínio em Vercel → Project → Settings → Domains.

### SSL
Vercel emite certificado Let's Encrypt automaticamente ao detectar o CNAME apontando pra ele.

## Backups

### Banco
Supabase free tier faz backup diário automático (retenção 7 dias) — ver Project → Database → Backups.

### Repo
GitHub `agf3xdev/vertiplay` — single source of truth.

### Secrets
- Vercel envs (prod) — não existe cópia local completa; `~/.vertiplay-supabase.env` guarda só as credenciais do banco
- Nunca commitar `.env.local`

### Keystore Android
**CRÍTICO** — sem ele, app na Play Store fica órfão:
- Local: `android/keystore/vertiplay-release.keystore`
- Backup: Obsidian Vault + offline (HD externo, etc)

## Troubleshooting

### Deploy falha no build
`vercel logs <url>` ou ver no dashboard → Deployments → build logs. Causa comum: `prisma generate` falhando por schema inválido.

### App responde 500 / erro de banco
Confirma que `DATABASE_URL`/`DIRECT_URL` estão setadas e que o projeto Supabase está `ACTIVE_HEALTHY` (não pausado por inatividade — free tier pausa após 7 dias sem uso).

### Checkout Stripe/MP falha
`STRIPE_SECRET_KEY` / `MERCADOPAGO_ACCESS_TOKEN` provavelmente não configurados ainda (ver tabela de envs acima).

### Login Google falha em modo Test
Adicionar email do user em Google Cloud Console → APIs & Services → OAuth consent screen → Test users. Ou publicar o app.
