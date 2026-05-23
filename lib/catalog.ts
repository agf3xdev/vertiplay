// Catálogo mock do Vertiplay — inspirado nos hits brasileiros e gêneros top
// de ReelShort/DramaBox (alfa, bilionário, máfia, vingança, CEO, amor proibido).
// Posters: Unsplash (free). Vídeos: clipes HLS públicos da Mux.

export type Episode = {
  number: number;
  title: string;
  durationSec: number;
  videoUrl: string;
  thumbUrl: string;
  isFree: boolean;
  costCoins: number;
};

export type Series = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  bannerUrl: string;
  genre: string;
  tags: string[];
  isExclusive: boolean;
  isFeatured: boolean;
  views: number;
  rating: number;
  totalEpisodes: number;
  freeEpisodes: number;
  episodes: Episode[];
};

const sampleVideos = [
  "https://stream.mux.com/v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM.m3u8",
  "https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe.m3u8",
  "https://stream.mux.com/A3VXy02VoUinw01pwyomEO3bHnG4P32xzV7u.m3u8",
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
];

// Posters agora vêm do gerador SVG local (/api/poster/[id]).
// Independente de fontes externas, sempre carrega, sempre on-brand.
const POSTER_OF = (seriesId: string) => `/api/poster/${seriesId}`;

const poster = (_q: string) => ""; // mantido só pra compat — overrided abaixo por id
const banner = (_q: string) => "";

// Fill helper — qualquer poster vazio é substituído pelo gerador local
function fillPosters() {
  SERIES.forEach((s) => {
    s.posterUrl = POSTER_OF(s.id);
    s.bannerUrl = POSTER_OF(s.id);
    s.episodes.forEach((ep) => (ep.thumbUrl = POSTER_OF(s.id)));
  });
}

function makeEpisodes(count: number, freeCount: number, baseThumb: string): Episode[] {
  return Array.from({ length: count }).map((_, i) => ({
    number: i + 1,
    title: `Episódio ${i + 1}`,
    durationSec: 60 + Math.floor(Math.random() * 30),
    videoUrl: sampleVideos[i % sampleVideos.length],
    thumbUrl: baseThumb,
    isFree: i < freeCount,
    costCoins: 20,
  }));
}

export const SERIES: Series[] = [
  {
    id: "s1",
    slug: "a-noiva-do-bilionario-cruel",
    title: "A Noiva do Bilionário Cruel",
    synopsis:
      "Forçada a casar com o herdeiro mais temido do Rio, Helena descobre que o frio CEO esconde um segredo que pode destruí-la — ou salvá-la.",
    posterUrl: poster("photo-1525134479668-1bee5c7c6845"),
    bannerUrl: banner("photo-1521572163474-6864f9cf17ab"),
    genre: "Bilionário",
    tags: ["ceo", "casamento-arranjado", "vinganca"],
    isExclusive: true,
    isFeatured: true,
    views: 5_800_000,
    rating: 4.8,
    totalEpisodes: 60,
    freeEpisodes: 3,
    episodes: makeEpisodes(60, 3, poster("photo-1525134479668-1bee5c7c6845")),
  },
  {
    id: "s2",
    slug: "rejeitada-pelo-alfa",
    title: "Rejeitada Pelo Alfa",
    synopsis:
      "Luna é descartada pelo próprio companheiro destinado. Anos depois, volta como a Alpha mais temida de todas as matilhas.",
    posterUrl: poster("photo-1518709268805-4e9042af2176"),
    bannerUrl: banner("photo-1518709268805-4e9042af2176"),
    genre: "Lobisomem",
    tags: ["alfa", "luna", "destino"],
    isExclusive: false,
    isFeatured: true,
    views: 4_300_000,
    rating: 4.7,
    totalEpisodes: 80,
    freeEpisodes: 3,
    episodes: makeEpisodes(80, 3, poster("photo-1518709268805-4e9042af2176")),
  },
  {
    id: "s3",
    slug: "noiva-cativa-da-mafia",
    title: "Noiva Cativa da Máfia",
    synopsis:
      "Sequestrada como acerto de dívida, ela vira a única arma do chefão contra a família rival.",
    posterUrl: poster("photo-1535398089889-dd807df1dfaa"),
    bannerUrl: banner("photo-1535398089889-dd807df1dfaa"),
    genre: "Máfia",
    tags: ["mafia", "vinganca", "perigo"],
    isExclusive: true,
    isFeatured: true,
    views: 5_800_000,
    rating: 4.9,
    totalEpisodes: 72,
    freeEpisodes: 3,
    episodes: makeEpisodes(72, 3, poster("photo-1535398089889-dd807df1dfaa")),
  },
  {
    id: "s4",
    slug: "casei-com-o-inimigo-do-meu-ex",
    title: "Casei com o Inimigo do Meu Ex",
    synopsis:
      "Para se vingar do noivo que a traiu no altar, Marina aceita o pedido do bilionário rival. O plano? Casamento de um ano. O problema? Eles se apaixonaram.",
    posterUrl: poster("photo-1519741497674-611481863552"),
    bannerUrl: banner("photo-1519741497674-611481863552"),
    genre: "Bilionário",
    tags: ["casamento", "vinganca", "ceo"],
    isExclusive: true,
    isFeatured: false,
    views: 2_200_000,
    rating: 4.6,
    totalEpisodes: 50,
    freeEpisodes: 3,
    episodes: makeEpisodes(50, 3, poster("photo-1519741497674-611481863552")),
  },
  {
    id: "s5",
    slug: "seu-marido-inutil-e-um-chefao",
    title: "Seu Marido Inútil é Um Chefão",
    synopsis:
      "Todos acham que ela casou com o homem mais fracassado da cidade. Ninguém sabe que ele comanda um império secreto.",
    posterUrl: poster("photo-1492562080023-ab3db95bfbce"),
    bannerUrl: banner("photo-1492562080023-ab3db95bfbce"),
    genre: "Identidade Oculta",
    tags: ["identidade-oculta", "ceo", "vinganca"],
    isExclusive: true,
    isFeatured: false,
    views: 3_900_000,
    rating: 4.8,
    totalEpisodes: 65,
    freeEpisodes: 3,
    episodes: makeEpisodes(65, 3, poster("photo-1492562080023-ab3db95bfbce")),
  },
  {
    id: "s6",
    slug: "entre-o-desejo-e-a-fe",
    title: "Entre o Desejo e a Fé",
    synopsis:
      "Ela jurou celibato ao altar. Ele é o homem mais perigoso da cidade — e o único que pode protegê-la.",
    posterUrl: poster("photo-1502161254066-6c74afbf07aa"),
    bannerUrl: banner("photo-1502161254066-6c74afbf07aa"),
    genre: "Amor Proibido",
    tags: ["amor-proibido", "religioso"],
    isExclusive: false,
    isFeatured: false,
    views: 1_400_000,
    rating: 4.5,
    totalEpisodes: 45,
    freeEpisodes: 3,
    episodes: makeEpisodes(45, 3, poster("photo-1502161254066-6c74afbf07aa")),
  },
  {
    id: "s7",
    slug: "o-aroma-da-minha-luna-destinada",
    title: "O Aroma da Minha Luna Destinada",
    synopsis:
      "Ele sentiu o cheiro dela do outro lado do salão. Agora vai destruir tudo para mantê-la.",
    posterUrl: poster("photo-1496180470114-6ef490f3ff22"),
    bannerUrl: banner("photo-1496180470114-6ef490f3ff22"),
    genre: "Lobisomem",
    tags: ["alfa", "luna", "destino"],
    isExclusive: false,
    isFeatured: false,
    views: 1_000_000,
    rating: 4.4,
    totalEpisodes: 55,
    freeEpisodes: 3,
    episodes: makeEpisodes(55, 3, poster("photo-1496180470114-6ef490f3ff22")),
  },
  {
    id: "s8",
    slug: "cuidado-eu-sou-a-chefona",
    title: "Cuidado! Eu Sou a Chefona",
    synopsis:
      "Demitida e humilhada, ela volta como dona de toda a empresa que a chutou para fora.",
    posterUrl: poster("photo-1573496359142-b8d87734a5a2"),
    bannerUrl: banner("photo-1573496359142-b8d87734a5a2"),
    genre: "CEO",
    tags: ["ceo", "vinganca", "empoderamento"],
    isExclusive: false,
    isFeatured: false,
    views: 2_700_000,
    rating: 4.7,
    totalEpisodes: 48,
    freeEpisodes: 3,
    episodes: makeEpisodes(48, 3, poster("photo-1573496359142-b8d87734a5a2")),
  },
  {
    id: "s9",
    slug: "a-vida-secreta-do-meu-marido-bilionario",
    title: "A Vida Secreta do Meu Marido Bilionário",
    synopsis:
      "Após cinco anos juntos, ela descobre que o marido faxineiro é o homem mais rico do país — e está sendo caçado.",
    posterUrl: poster("photo-1511376777868-27c8a31ad691"),
    bannerUrl: banner("photo-1511376777868-27c8a31ad691"),
    genre: "Bilionário",
    tags: ["identidade-oculta", "ceo"],
    isExclusive: true,
    isFeatured: true,
    views: 6_200_000,
    rating: 4.9,
    totalEpisodes: 90,
    freeEpisodes: 3,
    episodes: makeEpisodes(90, 3, poster("photo-1511376777868-27c8a31ad691")),
  },
  {
    id: "s10",
    slug: "reprodutora-do-rei-alfa",
    title: "Reprodutora do Rei Alfa",
    synopsis:
      "Escolhida entre cem mulheres para gerar o herdeiro do Rei Alfa, ela vai virar o jogo.",
    posterUrl: poster("photo-1488161628813-04466f872be2"),
    bannerUrl: banner("photo-1488161628813-04466f872be2"),
    genre: "Lobisomem",
    tags: ["alfa", "barriga-de-aluguel"],
    isExclusive: false,
    isFeatured: false,
    views: 3_400_000,
    rating: 4.6,
    totalEpisodes: 70,
    freeEpisodes: 3,
    episodes: makeEpisodes(70, 3, poster("photo-1488161628813-04466f872be2")),
  },
  {
    id: "s11",
    slug: "divorcio-a-altura",
    title: "Divórcio à Altura",
    synopsis:
      "Ele queria humilhá-la no divórcio. Ela tinha um sobrenome — e um exército — que ninguém imaginava.",
    posterUrl: poster("photo-1551836022-d5d88e9218df"),
    bannerUrl: banner("photo-1551836022-d5d88e9218df"),
    genre: "CEO",
    tags: ["vinganca", "identidade-oculta"],
    isExclusive: false,
    isFeatured: false,
    views: 1_100_000,
    rating: 4.5,
    totalEpisodes: 42,
    freeEpisodes: 3,
    episodes: makeEpisodes(42, 3, poster("photo-1551836022-d5d88e9218df")),
  },
  {
    id: "s12",
    slug: "sua-doce-bela",
    title: "Sua Doce Bela",
    synopsis:
      "Ela jurou nunca mais amar. Ele jurou nunca mais perder. Quando os caminhos se cruzam, alguém quebra a promessa.",
    posterUrl: poster("photo-1529626455594-4ff0802cfb7e"),
    bannerUrl: banner("photo-1529626455594-4ff0802cfb7e"),
    genre: "Amor Proibido",
    tags: ["segunda-chance", "ceo"],
    isExclusive: false,
    isFeatured: false,
    views: 880_000,
    rating: 4.4,
    totalEpisodes: 38,
    freeEpisodes: 3,
    episodes: makeEpisodes(38, 3, poster("photo-1529626455594-4ff0802cfb7e")),
  },
];

// Aplicar gerador local em todas as séries (sobrescreve URLs externas quebradas)
fillPosters();

export const GENRES = [
  "Bilionário",
  "Lobisomem",
  "Máfia",
  "CEO",
  "Amor Proibido",
  "Identidade Oculta",
  "Vingança",
  "Casamento",
];

export const COIN_PACKS = [
  { id: "p1", coins: 100, bonus: 0, priceBRL: 990, label: "Starter" },
  { id: "p2", coins: 300, bonus: 30, priceBRL: 2490, label: "Popular", popular: true },
  { id: "p3", coins: 600, bonus: 90, priceBRL: 4990, label: "Best Value" },
  { id: "p4", coins: 1500, bonus: 300, priceBRL: 9990, label: "Mega" },
  { id: "p5", coins: 3000, bonus: 750, priceBRL: 19990, label: "Whale" },
];

export const VIP_PLANS = [
  { id: "v1", name: "VIP Semanal", priceBRL: 1990, days: 7, coinsPerDay: 30 },
  { id: "v2", name: "VIP Mensal", priceBRL: 4990, days: 30, coinsPerDay: 50, popular: true },
  { id: "v3", name: "VIP Anual", priceBRL: 39900, days: 365, coinsPerDay: 100 },
];

export const DAILY_REWARDS = [10, 15, 20, 30, 40, 60, 100]; // 7 dias

export function findSeries(slugOrId: string): Series | undefined {
  return SERIES.find((s) => s.slug === slugOrId || s.id === slugOrId);
}

export function trending(limit = 8): Series[] {
  return [...SERIES].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function exclusives(limit = 8): Series[] {
  return SERIES.filter((s) => s.isExclusive).slice(0, limit);
}

export function byGenre(genre: string): Series[] {
  return SERIES.filter((s) => s.genre === genre);
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
