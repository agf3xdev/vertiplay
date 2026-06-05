# Routes (user-facing)

App Router em `app/`. Server Components por padrão; client components marcados com `"use client"`.

## Layout raiz

`app/layout.tsx`:
- Carrega fontes, Tailwind, providers
- Envolve em `<SessionProviderWrapper>` (NextAuth client)
- Renderiza `<RootShell>` que decide:
  - **Admin** (`/admin/*`): full-width, sem BottomNav
  - **App**: `mobile-frame` (480px container) + `<BottomNav>` fixo embaixo

## Rotas públicas

### `/` (Home)
`app/page.tsx` (Server) + `HomeClient.tsx` (Client)

- Tabs: Para Você / Novo / Rankings / Gênero
- Carrosséis de séries (`SERIES` do `lib/catalog.ts`)
- Banner UGC "Conte sua história"

### `/browse`
Descoberta com busca + filtros por gênero.

### `/series/:slug`
Detalhe da série. 3 tabs: **Episódios**, **Loja**, **Sobre**.

- Episódios: lista numerada com paywall (3 grátis, resto 20 coins)
- Loja: produtos linkados via `productsBySeries(seriesId)` + marca patrocinadora (`brandsBySeries`)
- Sobre: sinopse, gênero, tags, rating, views

### `/watch/:slug/:ep`
Player vertical full-screen.

- `<VerticalPlayer />` — HLS.js + paywall + side actions (like/share/gift)
- `<ShopOverlay />` — sacolinha shoppable com `productsInEpisode(seriesId, ep)`
- Swipe up = próximo ep

### `/shop`
Hub da loja: lista todas as marcas + produtos em destaque + categorias.

### `/shop/brand/:slug`
Página da marca. Lista produtos + séries patrocinadas.

### `/shop/product/:slug`
Detalhe do produto. Galeria, preço, "Adicionar ao carrinho", "Ver série onde aparece".

### `/cart`
Carrinho. Lista items, edita qty, vai pra checkout.

### `/checkout`
Endereço + método de pagamento (Stripe cartão ou MP PIX). Cria session no gateway.

## Rotas autenticadas

### `/wallet`
Carteira: coinsPaid + coinsBonus, packs de compra (Stripe/MP), planos VIP.

### `/rewards`
Daily check-in (7 dias rotativos: 10/15/20/30/40/60/100 coins). Missões diárias.

### `/profile`
Perfil do user logado. Pedidos, lojas seguidas, dados pessoais.

### `/friends`
Sistema social:
- Busca por @username
- Pedidos enviados/recebidos
- Lista de amigos
- "Ver perfil" → presentes (gifts)

### `/gifts`
Histórico de presentes recebidos.

### `/gifts/send`
Form de envio: escolhe amigo + tipo de gift (coins, VIP, série, produto) + mensagem.

### `/conte-sua-historia`
Formulário UGC. Cria `StorySubmission` pendente → admin processa em `/admin/stories`.

## Rotas legais

- `/privacidade` — política de privacidade (LGPD)
- `/termos` — termos de uso

## Auth

### `/auth`
Tela de login. Opções:
- Google (web ou nativo via Capacitor)
- Email OTP (6 dígitos via Resend)

Cliente detecta `window.Capacitor?.isNativePlatform()` → chama plugin nativo. Web → OAuth redirect.

## Admin

Ver `docs/ADMIN.md`. Rotas em `/admin/*`.

## BottomNav

5 tabs (`components/BottomNav.tsx`):
1. Home (`/`)
2. Browse (`/browse`)
3. Shop (`/shop`)
4. Friends (`/friends`)
5. Profile (`/profile`)

Esconde em `/admin/*` (via `RootShell`).

## Dynamic routes

| Rota | Param |
|---|---|
| `/series/:slug` | slug da série |
| `/watch/:slug/:ep` | slug + número do episódio |
| `/shop/brand/:slug` | slug da marca |
| `/shop/product/:slug` | slug do produto |
| `/admin/series/:id` | cuid |
| `/admin/brands/:id` | cuid |
| `/admin/products/:id` | cuid |

## Server vs Client components

**Server** (default):
- Todas as `page.tsx` que só fazem fetch + renderizam
- Admin pages que fazem queries Prisma diretas

**Client** (`"use client"`):
- `VerticalPlayer.tsx` (HLS, interatividade)
- `BottomNav.tsx` (usa `usePathname`)
- `RootShell.tsx` (path-based shell decision)
- Forms (auth, conte-sua-historia, friends search)
- `*Client.tsx` pages (HomeClient, SeriesDetailClient, ShopHubClient, BrandPageClient, ProductPageClient)
- Admin: client components pra forms (edit/new pages)
