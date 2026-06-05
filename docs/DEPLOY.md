# Deploy

## DigitalOcean App Platform

App ID: `bf466225-39f2-4102-bb5f-49dacd2436ca`
- Region: NYC
- Plan: `apps-s-1vcpu-0.5gb` (US$ 5/mês)
- Source: `https://github.com/agf3xdev/vertiplay` branch `main`
- Build: Docker (`Dockerfile`)
- Port: 3030

### Spec

`.do/app.yaml`:
```yaml
name: vertiplay
region: nyc
services:
  - name: web
    git:
      repo_clone_url: https://github.com/agf3xdev/vertiplay.git
      branch: main
    dockerfile_path: Dockerfile
    instance_size_slug: apps-s-1vcpu-0.5gb
    instance_count: 1
    http_port: 3030
    health_check:
      http_path: /api/health
      initial_delay_seconds: 30
      period_seconds: 15
    envs:
      - { key: NODE_ENV, value: production }
      - { key: NEXT_PUBLIC_APP_NAME, value: Vertiplay }
      - { key: NEXT_PUBLIC_APP_URL, value: "https://mvp.vertiplay.com.br" }
      - { key: NEXT_TELEMETRY_DISABLED, value: "1" }
```

Secrets (Stripe, MP, NextAuth, Resend, Google) configurados como `type: SECRET` direto no painel DO.

### Dockerfile

Multi-stage:
1. **deps** — `npm install --no-audit --no-fund`
2. **builder** — `npx prisma generate || true` + `npm run build`
3. **runner** — Node 22-alpine, user `nextjs:1001` (non-root)

Boot:
```sh
npx prisma db push --accept-data-loss --skip-generate && exec npx next start -p 3030
```

## Postgres Managed

Cluster: `vertiplay-db`
- Region: NYC3
- Plan: US$ 15.15/mês
- **Attached como recurso do app**: Create → Attach existing DigitalOcean database

A DO injeta `${vertiplay-db.DATABASE_URL}` em Run Time. **NÃO** setar `DATABASE_URL` manual — host privado só resolve via attach.

Migração: `prisma db push` no boot (Dockerfile). Quando schema estabilizar, trocar pra `migrate deploy`.

## Domínio

### DNS (Registro.br)
Domínio: `vertiplay.com.br`
- Nameservers: `a.auto.dns.br` + `b.auto.dns.br` (Registro.br próprio)
- **CNAME** `mvp` → `vertiplay-mozsm.ondigitalocean.app`
- TTL default

**Importante:** entrar só `mvp` no campo Nome, NÃO `mvp.vertiplay.com.br` (FQDN dá erro).

### SSL
DO emite via Let's Encrypt automaticamente. Issuer: Google Trust Services / Let's Encrypt.
- Propagação DNS: 5-30min
- Emissão de cert: 2-10min após DNS detectado

### Adicionar domínio
DO Console → App vertiplay → Settings → Networking → Add Domain:
1. Domain: `mvp.vertiplay.com.br`
2. Manage with: **External DNS provider** (mantém DNS no Registro.br)
3. CNAME alias mostrado: copia pro Registro.br

**NÃO** criar zona DNS no DO Networking → Domains. Isso quebra (criar só o domain no app).

## Pipeline de deploy

```
1. git push origin main
2. DO detecta push (GitHub webhook)
3. Build container (3-5min)
   ├─ npm install
   ├─ prisma generate
   └─ next build
4. Push pra registry interno DO
5. Rolling deploy (zero downtime)
6. Health check /api/health
7. Switch traffic
```

Logs: DO Console → App → Activity → Build/Deploy logs ou Runtime Logs (stdout).

## Rollback

DO Console → App → Activity → escolher deploy anterior → "Rollback to this deployment".

Banco: rollback de schema requer migration reversa. Pra MVP com `db push`, não tem migration — última opção é restore de snapshot do DB.

## Backups

### Postgres
DO Managed DB faz backups automáticos:
- Daily snapshots, retenção 7 dias
- Point-in-time recovery 7 dias

Acesso: DO Console → Databases → vertiplay-db → Backups.

### Repo
GitHub `agf3xdev/vertiplay` — single source of truth.

### Secrets
- `.env.local` (dev) — NUNCA commitar
- DO envs (prod) — exportar via `doctl apps spec get <APP_ID>` periodicamente

### Keystore Android
**CRÍTICO** — sem ele, app na Play Store fica órfão:
- Local: `android/keystore/vertiplay-release.keystore`
- Backup: Obsidian Vault + offline (HD externo, etc)

## Custos

| Item | Mensal |
|---|---|
| DO App Platform (apps-s-1vcpu-0.5gb) | US$ 5 |
| DO Managed Postgres | US$ 15.15 |
| Domain Registro.br | ~R$ 40/ano (R$ 3.33/mês) |
| Resend (free tier) | US$ 0 (até 3k emails/mês) |
| Stripe / MP | % por transação |
| Cloudflare R2 (vídeos) | US$ 0 (free tier até 10GB) |
| **Total infra** | **~US$ 21/mês** |

## Monitoring

- **Health check**: DO checa `/api/health` a cada 15s
- **Runtime logs**: DO Console → Runtime Logs
- **Build logs**: DO Console → Activity → Build
- **Alerts**: configurável em Settings → Alerts (sem alertas custom ainda)

## Comandos úteis (doctl)

```bash
# Listar apps
doctl apps list

# Get spec
doctl apps spec get bf466225-39f2-4102-bb5f-49dacd2436ca

# Logs
doctl apps logs bf466225-39f2-4102-bb5f-49dacd2436ca --type=run --follow

# Force redeploy
doctl apps create-deployment bf466225-39f2-4102-bb5f-49dacd2436ca

# Update env
doctl apps update bf466225-39f2-4102-bb5f-49dacd2436ca --spec .do/app.yaml
```

## Troubleshooting

### Deploy fica em "building" eternamente
- Olha Build Logs. Geralmente `npm install` timeout ou prisma generate falhou
- Solução: cancel + retry

### App responde 5xx
- Runtime Logs: erro de Prisma (DB não acessível?), env var faltando, port errado
- Health check fail: `/api/health` precisa retornar 200

### TLS handshake failure no domínio custom
- Cert ainda não emitido. Aguardar 5-10min após CNAME propagar
- Verifica via `https://dns.google/resolve?name=mvp.vertiplay.com.br&type=CNAME` se DNS bate

### Webhook Stripe/MP não chega
- Confirma URL configurada no dashboard do gateway
- Olha LedgerEntry pra ver se chegou e com qual `type` (signature_invalid?)
- Re-emitir webhook secret se necessário

### Login Google falha em modo Test
- Adicionar email do user em Google Cloud Console → APIs & Services → OAuth consent screen → Test users
- Ou publicar o app no Google (passa por verificação)
