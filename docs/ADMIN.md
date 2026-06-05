# Admin Panel

URL: `https://mvp.vertiplay.com.br/admin`

Painel completo pra gerenciar séries, episódios, marcas, produtos, campanhas, histórias UGC, usuários e ledger.

## Acesso

Allowlist por email em `lib/admin.ts`:

```ts
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "agenciaf3xia@gmail.com,livoolivecommerce@gmail.com")
    .split(",").map(s => s.trim().toLowerCase());
}
```

**Fluxo:**
1. Acessa `/admin/*`
2. `app/admin/layout.tsx` chama `auth()` → se sem sessão, redirect `/auth?callbackUrl=/admin`
3. Se logado mas `!isAdminEmail(email)` → mostra "Acesso restrito"
4. Se admin → renderiza `<AdminShell>` (sidebar + conteúdo)

## Estrutura

```
/admin                  Dashboard (stats + atalhos + seeds)
/admin/series           Lista séries
/admin/series/new       Form criar série
/admin/series/:id       Edit série + episódios
/admin/brands           Lista marcas
/admin/brands/new       Form criar marca
/admin/brands/:id       Edit marca
/admin/products         Lista produtos
/admin/products/new     Form criar produto
/admin/products/:id     Edit produto + appearances
/admin/campaigns        SeriesSponsorship (patrocínios)
/admin/stories          UGC submissions (aprovar/rejeitar)
/admin/users            Lista users + edit (coins, VIP)
/admin/ledger           Audit trail Stripe + MP
```

## Layout (`AdminShell.tsx`)

`components/admin/AdminShell.tsx`:
- Sidebar fixa (desktop) ou drawer (mobile)
- 8 itens: Dashboard, Séries, Marcas, Produtos, Campanhas, Histórias UGC, Usuários, Ledger
- Topo (mobile): hamburger + logo
- Bottom: email logado + botão Sair

## Dashboard (`app/admin/page.tsx`)

8 stat cards (parallel `Promise.all`):
- Usuários (total + novos 24h)
- Séries (total + episódios)
- Marcas (total + produtos)
- Campanhas (sponsorships ativos)
- Pedidos (total + pagos)
- Histórias UGC (total + pendentes)
- Receita 30d (sum amountBRL)
- Status ("🟢 online")

Lista de histórias pendentes (5 mais recentes).

Sidebar direita:
- **SeedShopButton** — botão "Importar catálogo do app" (popula DB com 12 séries + 11 marcas + ~30 produtos do `lib/catalog.ts`/`shop.ts`)
- **SeedDemoButton** — cria 1 série "Hotel das Sombras" demo
- Atalhos: + Nova série, + Nova marca, + Novo produto, + Nova campanha

## CRUDs

Padrão de cada recurso (séries/marcas/produtos/campanhas):

### Lista (`/admin/<resource>`)
- Server component
- `prisma.<resource>.findMany({ orderBy, include })`
- Tabela com colunas relevantes + botões "Editar" / "Excluir"
- Botão "+ Novo X" no header

### Criar (`/admin/<resource>/new`)
- Client component
- Form em React state
- onSubmit: `fetch("/api/admin/<resource>", { method: "POST", body: JSON })`
- Redirect pra `/admin/<resource>` em sucesso

### Editar (`/admin/<resource>/:id`)
- Server component carrega data + Client form
- Form pré-preenchido
- onSubmit: `fetch("/api/admin/<resource>/:id", { method: "PATCH" })`
- Botão "Excluir" → confirm() → DELETE → redirect

## Componentes reutilizáveis (`components/admin/ui.tsx`)

- `<PageHeader title subtitle>`
- `<StatCard label value hint>`
- `<PrimaryButton>` / `<SecondaryButton>`
- `<Card>` — container vp-card
- `<EmptyState title hint cta?>`
- `<Field label hint>` — wrapper de input
- `<Table>` / `<Th>` / `<Td>` — tabelas com style consistente
- `<Badge tone="ok|warn|err|info">`
- Classes: `inputCls`, `textareaCls`, `selectCls`

## Helpers (`lib/admin-api.ts`)

```ts
gate()             // retorna 403 se !isAdminSession, undefined se ok
slugify(s)         // normaliza para slug
parseInt0(v)       // string|number → int, fallback 0
parseFloat0(v)     // string|number → float, fallback 0
str(v)             // coerce string + trim
strOpt(v)          // coerce or null
bool(v)            // truthy → boolean
```

## Fluxos típicos

### Adicionar nova série
1. `/admin/series/new`
2. Preenche título, sinopse, posterUrl, gênero, tags (CSV), totalEpisodes, freeEpisodes
3. Submit → cria Series
4. Redireciona pra `/admin/series/:id`
5. Lá pode adicionar episódios (form inline)

### Adicionar marca + produto
1. `/admin/brands/new` → preenche e cria
2. `/admin/products/new` → seleciona brandId do dropdown, preenche
3. Em `/admin/products/:id`, adicionar "Aparições" linkando série + episódio + sceneNote

### Aprovar UGC
1. `/admin/stories` → tabela com pendentes
2. Clica em uma → vê sinopse completa
3. Botão "Aprovar" → PATCH status="approved" → email opcional pro autor

### Patrocinar série
1. `/admin/campaigns` → clica "+ Nova campanha"
2. Seleciona brandId + seriesId + tier (`"headline"` / `"standard"`)
3. Define startAt + endAt opcional
4. Cria SeriesSponsorship

### Editar wallet de user
1. `/admin/users` → busca por email
2. Edita coinsPaid, coinsBonus, isVip, vipExpiresAt
3. Salva → PATCH → user vê os créditos no próximo refresh

## Decisões

- **Sem soft delete:** DELETE é hard. Cascades garantem integridade.
- **Sem audit log de admin actions:** mudanças não são versionadas. Se importante, adicionar `AdminLog` model.
- **Sem upload de imagens:** todos os `imageUrl` são URLs externas (Unsplash, futuro R2). Próximo: integrar com R2 + pre-signed URLs.
- **Sem reset de senha:** auth é OAuth/OTP, não tem senha.
- **Sem bulk operations:** edição um-a-um. Pra importar muitos, usar `seed-shop`.

## Limitação atual: catalog estático

O app **user-facing** ainda lê `lib/catalog.ts` + `lib/shop.ts` (in-memory). O admin lê/escreve no Postgres.

**Implicação:** editar uma série no admin **não muda** o que aparece no app (`/series/:slug`). Só serve pra preparar o backend pra futuro switch.

**Solução planejada:** rotas user-facing migram pra Prisma queries. Endpoint `/api/admin/seed-shop` já popula o DB com tudo do static catalog, facilitando essa transição.
