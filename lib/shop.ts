// Shop layer do Vertiplay — marcas patrocinadoras e produtos shoppable.
// Cada produto está ligado a uma ou mais séries (e opcionalmente a episódios).
// "Ver na cena → comprar" é o diferencial.

import { SERIES } from "./catalog";

export type Brand = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  coverUrl: string;
  bio: string;
  website: string;
  category: string;
  isVerified: boolean;
};

export type Product = {
  id: string;
  brandId: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  priceBRL: number;       // centavos
  oldPriceBRL?: number;   // centavos
  category: string;
  stock: number;
  rating: number;
  // aparições na série
  appearances: { seriesId: string; episode?: number; sceneNote?: string }[];
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=900&q=80`;

const logo = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=300&q=80`;

export const BRANDS: Brand[] = [
  {
    id: "b1",
    slug: "atelie-bela",
    name: "Ateliê Bela",
    logoUrl: logo("photo-1469334031218-e382a71b716b"),
    coverUrl: img("photo-1490481651871-ab68de25d43d"),
    bio: "Vestidos sob medida feitos no Rio de Janeiro. Cada peça conta uma história.",
    website: "https://ateliebela.com.br",
    category: "Moda",
    isVerified: true,
  },
  {
    id: "b2",
    slug: "casa-norte",
    name: "Casa Norte",
    logoUrl: logo("photo-1556228453-efd6c1ff04f6"),
    coverUrl: img("photo-1555041469-a586c61ea9bc"),
    bio: "Móveis autorais e ambientação cinematográfica. Decoração com personalidade.",
    website: "https://casanorte.com.br",
    category: "Casa",
    isVerified: true,
  },
  {
    id: "b3",
    slug: "fervor-perfumaria",
    name: "Fervor Perfumaria",
    logoUrl: logo("photo-1541643600914-78b084683601"),
    coverUrl: img("photo-1592945403244-b3fbafd7f539"),
    bio: "Perfumes artesanais brasileiros. Notas de cinema, paixão e drama.",
    website: "https://fervor.com.br",
    category: "Beleza",
    isVerified: true,
  },
  {
    id: "b4",
    slug: "dominio-relogios",
    name: "Domínio Relógios",
    logoUrl: logo("photo-1523275335684-37898b6baf30"),
    coverUrl: img("photo-1542496658-e33a6d0d50f6"),
    bio: "Relógios para quem comanda o tempo. Edições limitadas e suíças.",
    website: "https://dominio.com.br",
    category: "Joias",
    isVerified: true,
  },
  {
    id: "b5",
    slug: "luminaria-casa",
    name: "Luminária Casa",
    logoUrl: logo("photo-1565814329452-e1efa11c5b89"),
    coverUrl: img("photo-1513506003901-1e6a229e2d15"),
    bio: "Iluminação cinematográfica para a sua casa virar set de novela.",
    website: "https://luminariacasa.com.br",
    category: "Casa",
    isVerified: false,
  },
  {
    id: "b6",
    slug: "joalheria-tropical",
    name: "Joalheria Tropical",
    logoUrl: logo("photo-1543294001-f7cd5d7fb516"),
    coverUrl: img("photo-1599643478518-a784e5dc4c8f"),
    bio: "Ouro 18k, pedras brasileiras. As joias que aparecem nos closes mais marcantes.",
    website: "https://tropicaljoias.com.br",
    category: "Joias",
    isVerified: true,
  },
  {
    id: "b7",
    slug: "eletro-prime",
    name: "Eletro Prime",
    logoUrl: logo("photo-1581092334651-ddf26d9a09d0"),
    coverUrl: img("photo-1556909114-f6e7ad7d3136"),
    bio: "Eletrodomésticos premium. A geladeira que aparece na cozinha da Helena.",
    website: "https://eletroprime.com.br",
    category: "Eletro",
    isVerified: true,
  },
];

const findBrand = (slug: string) => BRANDS.find((b) => b.slug === slug)!;

export const PRODUCTS: Product[] = [
  // === Da série "A Noiva do Bilionário Cruel" (s1) ===
  {
    id: "p1",
    brandId: findBrand("atelie-bela").id,
    slug: "vestido-helena-jantar",
    name: "Vestido Helena — Jantar",
    description:
      "O vestido midi de seda que Helena usa no jantar com o sogro. Decote canoa, fenda lateral, costura artesanal. Disponível em 3 cores.",
    imageUrl: img("photo-1539109136881-3be0616acf4b"),
    gallery: [
      img("photo-1539109136881-3be0616acf4b"),
      img("photo-1490481651871-ab68de25d43d"),
    ],
    priceBRL: 89900,
    oldPriceBRL: 129900,
    category: "Vestido",
    stock: 14,
    rating: 4.9,
    appearances: [{ seriesId: "s1", episode: 4, sceneNote: "Cena do jantar com o Conselho" }],
  },
  {
    id: "p2",
    brandId: findBrand("dominio-relogios").id,
    slug: "relogio-bilionario-aco",
    name: "Relógio Bilionário Aço Negro",
    description:
      "O relógio que o CEO Rafael não tira do pulso. Maquinaria suíça, caixa em aço PVD preto, pulseira de couro italiano.",
    imageUrl: img("photo-1524592094714-0f0654e20314"),
    gallery: [img("photo-1524592094714-0f0654e20314")],
    priceBRL: 459000,
    category: "Relógio",
    stock: 6,
    rating: 4.8,
    appearances: [
      { seriesId: "s1", sceneNote: "Em quase todos os episódios do Rafael" },
      { seriesId: "s4" },
    ],
  },
  {
    id: "p3",
    brandId: findBrand("fervor-perfumaria").id,
    slug: "perfume-noite-cativa",
    name: "Perfume Noite Cativa — Eau de Parfum",
    description:
      "Notas de baunilha, âmbar e couro. O perfume que Helena usa antes do confronto final. Frasco 100ml.",
    imageUrl: img("photo-1541643600914-78b084683601"),
    gallery: [img("photo-1541643600914-78b084683601")],
    priceBRL: 32900,
    oldPriceBRL: 39900,
    category: "Perfume",
    stock: 38,
    rating: 4.7,
    appearances: [
      { seriesId: "s1", episode: 12 },
      { seriesId: "s3", episode: 8 },
    ],
  },
  {
    id: "p4",
    brandId: findBrand("casa-norte").id,
    slug: "poltrona-trono-couro",
    name: "Poltrona Trono — Couro Caramelo",
    description:
      "A poltrona da sala de reuniões da família. Couro brasileiro curtido, estrutura em madeira maciça.",
    imageUrl: img("photo-1567538096630-e0c55bd6374c"),
    gallery: [img("photo-1567538096630-e0c55bd6374c")],
    priceBRL: 489000,
    category: "Sofá",
    stock: 3,
    rating: 4.9,
    appearances: [
      { seriesId: "s1", sceneNote: "Escritório do patriarca" },
      { seriesId: "s5", sceneNote: "Cobertura do chefão" },
    ],
  },

  // === Da série "Rejeitada Pelo Alfa" (s2) ===
  {
    id: "p5",
    brandId: findBrand("joalheria-tropical").id,
    slug: "colar-luna-prata",
    name: "Colar Luna — Prata 925",
    description:
      "A meia-lua de prata que Luna usa desde o primeiro episódio. Pingente com pedra de quartzo branco.",
    imageUrl: img("photo-1599643478518-a784e5dc4c8f"),
    gallery: [img("photo-1599643478518-a784e5dc4c8f")],
    priceBRL: 24900,
    category: "Colar",
    stock: 22,
    rating: 4.8,
    appearances: [{ seriesId: "s2", sceneNote: "Símbolo de identidade da Luna" }],
  },
  {
    id: "p6",
    brandId: findBrand("atelie-bela").id,
    slug: "vestido-luna-cerimonia",
    name: "Vestido Luna — Cerimônia",
    description:
      "Tomara-que-caia bordado à mão. O vestido da cerimônia do Conselho dos Alfas.",
    imageUrl: img("photo-1502716119720-b23a93e5fe1b"),
    gallery: [img("photo-1502716119720-b23a93e5fe1b")],
    priceBRL: 119900,
    category: "Vestido",
    stock: 9,
    rating: 4.9,
    appearances: [{ seriesId: "s2", episode: 22 }],
  },

  // === "Noiva Cativa da Máfia" (s3) ===
  {
    id: "p7",
    brandId: findBrand("joalheria-tropical").id,
    slug: "anel-mafia-rubi",
    name: "Anel Máfia — Rubi Sangue",
    description:
      "O anel que sela o pacto. Ouro 18k, rubi natural lapidação coxim. Edição limitada.",
    imageUrl: img("photo-1605100804763-247f67b3557e"),
    gallery: [img("photo-1605100804763-247f67b3557e")],
    priceBRL: 689000,
    oldPriceBRL: 799000,
    category: "Anel",
    stock: 4,
    rating: 5.0,
    appearances: [{ seriesId: "s3", episode: 1, sceneNote: "Pedido forçado" }],
  },
  {
    id: "p8",
    brandId: findBrand("fervor-perfumaria").id,
    slug: "perfume-chefao-eau",
    name: "Perfume Chefão — Eau de Toilette",
    description:
      "Notas de couro, fumaça e cedro. O perfume do chefão. Para quem manda.",
    imageUrl: img("photo-1592945403244-b3fbafd7f539"),
    gallery: [img("photo-1592945403244-b3fbafd7f539")],
    priceBRL: 28900,
    category: "Perfume",
    stock: 41,
    rating: 4.6,
    appearances: [{ seriesId: "s3" }, { seriesId: "s5" }],
  },

  // === "Casei com o Inimigo" (s4) ===
  {
    id: "p9",
    brandId: findBrand("atelie-bela").id,
    slug: "vestido-noiva-vermelho",
    name: "Vestido de Noiva Vermelho",
    description:
      "O vestido vermelho da Marina no altar — escândalo no casamento. Tafetá italiano, cauda removível.",
    imageUrl: img("photo-1525257831700-3534c34a9919"),
    gallery: [img("photo-1525257831700-3534c34a9919")],
    priceBRL: 359000,
    category: "Vestido",
    stock: 2,
    rating: 4.9,
    appearances: [{ seriesId: "s4", episode: 1 }],
  },

  // === "Marido Inútil é Chefão" (s5) ===
  {
    id: "p10",
    brandId: findBrand("eletro-prime").id,
    slug: "cafeteira-prime-bronze",
    name: "Cafeteira Prime Bronze",
    description:
      "A cafeteira da cozinha do chefão. Italiana, bombe expresso, design vintage.",
    imageUrl: img("photo-1559305616-e7a8a6fb7f24"),
    gallery: [img("photo-1559305616-e7a8a6fb7f24")],
    priceBRL: 189000,
    oldPriceBRL: 249000,
    category: "Cafeteira",
    stock: 17,
    rating: 4.7,
    appearances: [{ seriesId: "s5", sceneNote: "Café da manhã todos os dias" }],
  },
  {
    id: "p11",
    brandId: findBrand("casa-norte").id,
    slug: "mesa-jantar-noite",
    name: "Mesa de Jantar Noite — 8 lugares",
    description:
      "Mesa em madeira ebanizada, tampo único. A mesa onde acontecem as cenas mais tensas.",
    imageUrl: img("photo-1555041469-a586c61ea9bc"),
    gallery: [img("photo-1555041469-a586c61ea9bc")],
    priceBRL: 729000,
    category: "Mesa",
    stock: 1,
    rating: 5.0,
    appearances: [{ seriesId: "s5" }, { seriesId: "s1" }],
  },

  // === "Entre o Desejo e a Fé" (s6) ===
  {
    id: "p12",
    brandId: findBrand("joalheria-tropical").id,
    slug: "cruz-prata-fe",
    name: "Cruz Prata Fé",
    description: "A cruz que ela não tira do pescoço. Prata 925 envelhecida.",
    imageUrl: img("photo-1611652022419-a9419f74343d"),
    gallery: [img("photo-1611652022419-a9419f74343d")],
    priceBRL: 18900,
    category: "Colar",
    stock: 60,
    rating: 4.8,
    appearances: [{ seriesId: "s6" }],
  },

  // === "Chefona" (s8) ===
  {
    id: "p13",
    brandId: findBrand("atelie-bela").id,
    slug: "blazer-poder",
    name: "Blazer Poder — Alfaiataria",
    description:
      "Blazer estruturado de alfaiataria, lã italiana. Para CEO destruir reunião.",
    imageUrl: img("photo-1551803091-e20673f15770"),
    gallery: [img("photo-1551803091-e20673f15770")],
    priceBRL: 149900,
    category: "Blazer",
    stock: 11,
    rating: 4.9,
    appearances: [{ seriesId: "s8", sceneNote: "Cena da volta triunfal" }],
  },
  {
    id: "p14",
    brandId: findBrand("luminaria-casa").id,
    slug: "luminaria-arco-dourada",
    name: "Luminária Arco Dourada",
    description: "Arco dourado, base mármore, lâmpada LED. A luz do escritório dela.",
    imageUrl: img("photo-1513506003901-1e6a229e2d15"),
    gallery: [img("photo-1513506003901-1e6a229e2d15")],
    priceBRL: 119000,
    category: "Iluminação",
    stock: 23,
    rating: 4.6,
    appearances: [{ seriesId: "s8" }, { seriesId: "s11" }],
  },

  // === Adicionais espalhados ===
  {
    id: "p15",
    brandId: findBrand("eletro-prime").id,
    slug: "geladeira-french-door-prime",
    name: "Geladeira French Door Prime 540L",
    description:
      "Geladeira inox escovado, dispenser água/gelo. A geladeira da cobertura.",
    imageUrl: img("photo-1556909114-f6e7ad7d3136"),
    gallery: [img("photo-1556909114-f6e7ad7d3136")],
    priceBRL: 1389000,
    category: "Geladeira",
    stock: 5,
    rating: 4.7,
    appearances: [{ seriesId: "s9" }, { seriesId: "s5" }],
  },
  {
    id: "p16",
    brandId: findBrand("fervor-perfumaria").id,
    slug: "perfume-luna-tropical",
    name: "Perfume Luna Tropical",
    description: "Notas de jasmim noturno e madeira de pau-rosa. O perfume da Luna.",
    imageUrl: img("photo-1523293182086-7651a899d37f"),
    gallery: [img("photo-1523293182086-7651a899d37f")],
    priceBRL: 24900,
    category: "Perfume",
    stock: 80,
    rating: 4.5,
    appearances: [{ seriesId: "s2" }, { seriesId: "s7" }, { seriesId: "s10" }],
  },
];

export const PRODUCT_CATEGORIES = [
  "Vestido",
  "Blazer",
  "Relógio",
  "Anel",
  "Colar",
  "Perfume",
  "Sofá",
  "Mesa",
  "Iluminação",
  "Cafeteira",
  "Geladeira",
];

// ──────────────── helpers ────────────────

export function findBrandBySlug(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function findProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsBySeries(seriesId: string): Product[] {
  return PRODUCTS.filter((p) => p.appearances.some((a) => a.seriesId === seriesId));
}

export function productsByBrand(brandId: string): Product[] {
  return PRODUCTS.filter((p) => p.brandId === brandId);
}

export function brandsBySeries(seriesId: string): Brand[] {
  const ps = productsBySeries(seriesId);
  const ids = new Set(ps.map((p) => p.brandId));
  return BRANDS.filter((b) => ids.has(b.id));
}

export function seriesByBrand(brandId: string) {
  const productList = productsByBrand(brandId);
  const seriesIds = new Set<string>();
  productList.forEach((p) => p.appearances.forEach((a) => seriesIds.add(a.seriesId)));
  return SERIES.filter((s) => seriesIds.has(s.id));
}

export function productsInEpisode(seriesId: string, episode: number): Product[] {
  return PRODUCTS.filter((p) =>
    p.appearances.some(
      (a) => a.seriesId === seriesId && (!a.episode || a.episode === episode)
    )
  );
}

export function searchProducts(q: string): Product[] {
  const term = q.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
  );
}
