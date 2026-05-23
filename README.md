# Vertiplay

Mini-novelas verticais brasileiras. Inspirado em ReelShort e DramaBox, com um diferencial: **shop sponsored por série** — cada produção tem um catálogo de produtos que aparecem nas cenas (roupas, móveis, perfumes, eletro), patrocinados por marcas parceiras.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) — mobile-first PWA
- **Prisma + Postgres** (SQLite no MVP)
- **HLS.js** para streaming vertical adaptativo
- **Zustand** com persist para carteira, watchlist, carrinho
- **Lucide** ícones

## Mercado (2025 → 2026)

- Short drama apps: **US$ 2,98 bi** IAP em 2025 (+115% YoY)
- ReelShort: ~US$ 1,2 bi/ano · DramaBox: US$ 323M (2024)
- ~70% do gasto global concentrado em ReelShort + DramaBox
- Brasil: Globo lançou GloboPop, ReelShort estreou série BR (`A Vida Secreta do Meu Marido Bilionário`)

## Como Vertiplay se diferencia

| | ReelShort | DramaBox | **Vertiplay** |
|---|---|---|---|
| Player vertical | ✓ | ✓ | ✓ |
| Coins + Bonus | ✓ | ✓ | ✓ |
| Daily check-in | ✓ | ✓ | ✓ |
| VIP/Subscription | ✓ | ✓ | ✓ |
| Conteúdo BR-first | parcial | parcial | **✓ nativo** |
| **Loja shoppable por série** | ✗ | ✗ | **✓** |
| Marcas patrocinadoras com catálogo | ✗ | ✗ | **✓** |

## Estrutura

```
app/
  page.tsx                Home com tabs (Para Você / Novo / Rankings / gêneros)
  browse/                 Descobrir e busca
  series/[slug]/          Detalhe da série (Episódios / Loja / Sobre)
  watch/[slug]/[ep]/      Player vertical full-screen + paywall coins
  shop/                   Hub da loja
    brand/[slug]/         Página da marca patrocinadora
    product/[slug]/       Detalhe do produto
  cart/                   Carrinho
  checkout/               Pagamento (Pix / Cartão)
  wallet/                 Carteira (coins + VIP)
  rewards/                Daily check-in + missões
  profile/                Perfil + pedidos + lojas seguidas
  api/                    health, catalog, shop

components/
  VerticalPlayer.tsx      Player HLS + paywall + side actions + ShopOverlay
  ShopOverlay.tsx         Sacolinha "da cena" no player
  BottomNav.tsx           Navegação inferior (5 tabs)
  CoinBadge.tsx / CartButton.tsx / Logo.tsx

lib/
  catalog.ts              12 séries mock (gêneros e capas no estilo BR)
  shop.ts                 7 marcas, 16 produtos vinculados às séries
  store.ts                Zustand (wallet, watchlist, unlocks, cart, follows)
```

## Setup local

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
# http://localhost:3030
```

## Deploy

Targets **DigitalOcean**:

- **App Platform**: `doctl apps create --spec .do/app.yaml`
- **Droplet com Docker**: `docker compose up -d --build`

Recursos auxiliares na DO:
- **DO Spaces** para storage de vídeo (compatível S3, troca por R2 quando quiser)
- **DO Managed Postgres** para o banco
- **DO Container Registry** (opcional) para builds

## Próximos passos (pós-MVP)

1. NextAuth com Google/Apple
2. Stripe + Mercado Pago Pix reais (webhooks)
3. Encoder HLS (ffmpeg + S3/Spaces) e DRM
4. Painel admin (upload de séries, episódios, briefing de patrocínio)
5. CMS para marcas adicionarem produtos shoppable
6. Push notifications (lançamentos, daily reminder)
7. App nativo (React Native ou Capacitor com o mesmo backend)
8. Analytics: GA4 + posthog + tracking por scene-item

Made by **F3X**.
