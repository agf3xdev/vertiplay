# Payments

Dois gateways em paralelo: **Stripe** (cartão internacional) + **Mercado Pago** (PIX/cartão BR/boleto). Ambos em modo **LIVE** desde maio/2026.

## Stripe

### Setup
- Account: `acct_*` (Vertiplay)
- Modo: **Live** (chaves `sk_live_*` e `pk_live_*`)
- Webhook endpoint: `https://mvp.vertiplay.com.br/api/stripe/webhook`
- Eventos assinados: `checkout.session.completed`, `payment_intent.succeeded`

### Env vars
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Fluxo de compra (coins/VIP)

```
1. /wallet → user clica em pack de coins (ex: R$ 24,90 / 300+30 coins)
2. POST /api/stripe/checkout {
     kind: "coins" | "vip",
     packId: "p2",
     userId: <session.id>
   }
3. Server: stripe.checkout.sessions.create({
     mode: "payment",
     line_items: [...],
     metadata: { userId, kind, packId },
     success_url: "/wallet?ok=1",
     cancel_url: "/wallet?cancel=1",
   })
4. Cliente: redirect pra Stripe Checkout (hosted)
5. Pagamento → Stripe redireciona pra success_url
6. Webhook: checkout.session.completed
   → valida assinatura HMAC com STRIPE_WEBHOOK_SECRET
   → lê metadata
   → credita coins no User
   → cria Transaction { kind: "purchase" } + LedgerEntry { source: "stripe" }
```

### Fluxo de compra (shoppable / cart)

Mesmo fluxo, mas `line_items` é o cart inteiro e ao confirmar cria `Order` + `OrderItem`.

### Arquivos
- `lib/stripe.ts` — singleton client + helpers
- `app/api/stripe/checkout/route.ts` — POST cria session
- `app/api/stripe/webhook/route.ts` — POST recebe eventos (signature check)

## Mercado Pago

### Setup
- Account: vinculada ao Diogo Archanjo
- Modo: **Live**
- Webhook endpoint: `https://mvp.vertiplay.com.br/api/mp/webhook`

### Env vars
```
MP_ACCESS_TOKEN=APP_USR_...
MP_WEBHOOK_SECRET=...
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR_PUBKEY
```

### Fluxo PIX

```
1. /checkout → user escolhe PIX
2. POST /api/mp/checkout {
     items: [...],
     payerEmail,
     userId
   }
3. Server: mp.payment.create({
     transaction_amount: total,
     payment_method_id: "pix",
     payer: { email: payerEmail },
     metadata: { userId, kind }
   })
4. MP devolve QR code + brcode (copia-e-cola)
5. Cliente exibe QR
6. User paga via app do banco
7. Webhook: type=payment, action=payment.created/updated
   → fetch detalhes via mp.payment.get(id)
   → se status=approved: credita coins / marca Order paid
   → LedgerEntry { source: "mp" }
```

### Webhook signature

MP envia header `x-signature: ts=...,v1=hmac`. Validação:

```ts
const expected = hmacSha256(MP_WEBHOOK_SECRET, `id:${id};ts:${ts};`);
if (expected !== v1) { 
  await prisma.ledgerEntry.create({ data: { source: "mp", type: "signature_invalid", ... }});
  return 401;
}
```

### Arquivos
- `lib/mercadopago.ts` — config SDK
- `app/api/mp/checkout/route.ts` — cria preference
- `app/api/mp/webhook/route.ts` — recebe eventos

## Modelo de preços

### Coin packs (em `lib/catalog.ts` → `COIN_PACKS`)

| ID | Coins | Bonus | Preço | Label |
|---|---|---|---|---|
| p1 | 100 | 0 | R$ 9,90 | Starter |
| p2 | 300 | 30 | R$ 24,90 | Popular |
| p3 | 600 | 90 | R$ 49,90 | Best Value |
| p4 | 1500 | 300 | R$ 99,90 | Mega |
| p5 | 3000 | 750 | R$ 199,90 | Whale |

### VIP plans (`VIP_PLANS`)

| ID | Plano | Preço | Dias | Coins/dia |
|---|---|---|---|---|
| v1 | VIP Semanal | R$ 19,90 | 7 | 30 |
| v2 | VIP Mensal | R$ 49,90 | 30 | 50 |
| v3 | VIP Anual | R$ 399,00 | 365 | 100 |

## Ledger (audit)

Todo evento de gateway vira `LedgerEntry`:

```ts
{
  source: "stripe" | "mp",
  type: "payment" | "ignored" | "error" | "signature_invalid",
  paymentId: "pi_...",
  status: "succeeded",
  amount: 24.90,
  method: "card" | "pix",
  userId: "ckxxx",
  kind: "purchase",
  meta: { /* payload completo */ },
  at: Date
}
```

Query útil:
```sql
SELECT source, type, COUNT(*), SUM(amount)
FROM "LedgerEntry"
WHERE "at" >= NOW() - INTERVAL '30 days'
GROUP BY source, type;
```

Acessível via `/admin/ledger`.

## Erros conhecidos & decisões

- **Stripe + Apple Pay**: não configurado ainda. Apple Pay requer domain verification (file in `.well-known/`).
- **MP 3DS**: não implementado. PIX não precisa, cartão pode ter chargeback.
- **Reembolsos**: feitos manualmente nos dashboards. Não tem endpoint admin pra issue refund.
- **Idempotência de webhook**: cada `paymentId` é único. Se mesmo evento chegar 2x, o segundo é `type: "ignored"`.
