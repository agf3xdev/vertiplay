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

// Imagens reais via Unsplash CDN
const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=900&q=80`;
const logo = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=300&q=80`;
const cover = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1600&q=80`;

export const BRANDS: Brand[] = [
  // ═══════════════ MARCAS REAIS PARCEIRAS ═══════════════
  {
    id: "br1",
    slug: "primus-rio",
    name: "Primus Rio",
    logoUrl: logo("photo-1556228453-efd6c1ff04f6"),
    coverUrl: cover("photo-1556909114-f6e7ad7d3136"),
    bio:
      "Utilidades para o lar e brinquedos no atacado e varejo. Frete grátis Sul/Sudeste/Centro-Oeste acima de R$ 150. Direto do Rio pra sua casa.",
    website: "https://primusrio.plataformaneo.com.br",
    category: "Casa & Lar",
    isVerified: true,
  },
  {
    id: "br2",
    slug: "mui",
    name: "MUI",
    logoUrl: logo("photo-1469334031218-e382a71b716b"),
    coverUrl: cover("photo-1490481651871-ab68de25d43d"),
    bio:
      "Moda feminina contemporânea. Peças autorais em linho, bordados artesanais e estética coastal. Coleções Lua e Maresia.",
    website: "https://www.usemui.com.br",
    category: "Moda",
    isVerified: true,
  },
  {
    id: "br3",
    slug: "o-amigao",
    name: "O Amigão",
    logoUrl: logo("photo-1542838132-92c53300491e"),
    coverUrl: cover("photo-1542838132-92c53300491e"),
    bio:
      "Supermercado nascido no Rio em 1997. 41 lojas, mais de 9 mil produtos. O bairro com preço de atacado.",
    website: "https://oamigao.com.br",
    category: "Supermercado",
    isVerified: true,
  },
  {
    id: "br4",
    slug: "tubarao-atacadao",
    name: "Tubarão Atacadão",
    logoUrl: logo("photo-1581092334651-ddf26d9a09d0"),
    coverUrl: cover("photo-1581092334651-ddf26d9a09d0"),
    bio:
      "Atacarejo carioca. 13 megastores no RJ + 2 em MG. +50 mil itens — utilidades, eletro, ferramentas, decoração. Preço de atacado mesmo levando 1 só.",
    website: "https://www.tubaraoatacadao.com.br",
    category: "Atacado",
    isVerified: true,
  },

  // ═══════════════ MARCAS PARCEIRAS NARRATIVAS ═══════════════
  {
    id: "b1",
    slug: "atelie-bela",
    name: "Ateliê Bela",
    logoUrl: logo("photo-1469334031218-e382a71b716b"),
    coverUrl: cover("photo-1490481651871-ab68de25d43d"),
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
    coverUrl: cover("photo-1555041469-a586c61ea9bc"),
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
    coverUrl: cover("photo-1592945403244-b3fbafd7f539"),
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
    coverUrl: cover("photo-1542496658-e33a6d0d50f6"),
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
    coverUrl: cover("photo-1513506003901-1e6a229e2d15"),
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
    coverUrl: cover("photo-1599643478518-a784e5dc4c8f"),
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
    coverUrl: cover("photo-1556909114-f6e7ad7d3136"),
    bio: "Eletrodomésticos premium. A geladeira que aparece na cozinha da Helena.",
    website: "https://eletroprime.com.br",
    category: "Eletro",
    isVerified: true,
  },
];

const findBrand = (slug: string) => BRANDS.find((b) => b.slug === slug)!;

export const PRODUCTS: Product[] = [
  // ═══════════════════════════════════════════════════════════════
  // PRIMUS RIO — utilidades do lar + brinquedos
  // ═══════════════════════════════════════════════════════════════
  {
    id: "pr1",
    brandId: "br1",
    slug: "jogo-cama-queen-bordado-primus",
    name: "Jogo de Cama Queen Bordado 4 Peças",
    description:
      "Conjunto Queen 4 peças (lençol + 2 fronhas + colcha) em percal 200 fios com bordado clássico. O jogo que veste a cama da Helena na mansão.",
    imageUrl: img("photo-1631049307264-da0ec9d70304"),
    gallery: [img("photo-1631049307264-da0ec9d70304")],
    priceBRL: 29900,
    oldPriceBRL: 39900,
    category: "Casa",
    stock: 48,
    rating: 4.6,
    appearances: [{ seriesId: "s1", episode: 6, sceneNote: "Quarto da Helena" }],
  },
  {
    id: "pr2",
    brandId: "br1",
    slug: "kit-panelas-antiaderente-primus",
    name: "Kit Panelas Antiaderente 8 Peças",
    description:
      "8 peças com fundo triplo, cabos baquelite, antiaderente reforçado. Indução compatível.",
    imageUrl: img("photo-1556909114-f6e7ad7d3136"),
    gallery: [img("photo-1556909114-f6e7ad7d3136")],
    priceBRL: 39900,
    oldPriceBRL: 59900,
    category: "Casa",
    stock: 32,
    rating: 4.7,
    appearances: [{ seriesId: "s5", sceneNote: "Cozinha do café da manhã" }],
  },
  {
    id: "pr3",
    brandId: "br1",
    slug: "boneca-reborn-colecao-primus",
    name: "Boneca Reborn Coleção 55cm",
    description:
      "Boneca colecionável reborn, vinil siliconado, roupa removível, cabelo implantado fio a fio.",
    imageUrl: img("photo-1558877385-81a1c7e67d72"),
    gallery: [img("photo-1558877385-81a1c7e67d72")],
    priceBRL: 19900,
    category: "Brinquedo",
    stock: 18,
    rating: 4.8,
    appearances: [{ seriesId: "s7", sceneNote: "Brinquedo da filha" }],
  },
  {
    id: "pr4",
    brandId: "br1",
    slug: "organizador-modular-closet-primus",
    name: "Organizador Modular para Closet",
    description:
      "Sistema de 12 módulos empilháveis para roupas, sapatos e acessórios. Aço cromado + tecido.",
    imageUrl: img("photo-1558997519-83ea9252edf8"),
    gallery: [img("photo-1558997519-83ea9252edf8")],
    priceBRL: 14900,
    oldPriceBRL: 19900,
    category: "Casa",
    stock: 60,
    rating: 4.5,
    appearances: [{ seriesId: "s4", sceneNote: "Closet da Marina" }],
  },

  // ═══════════════════════════════════════════════════════════════
  // MUI — moda feminina, linho
  // ═══════════════════════════════════════════════════════════════
  {
    id: "mui1",
    brandId: "br2",
    slug: "vestido-midi-linho-marinho-mui",
    name: "Vestido Midi Linho Marinho",
    description:
      "Vestido midi em linho 100%, decote V, alças finas, cintura marcada. Coleção Maresia.",
    imageUrl: img("photo-1612722432474-b971cdcea546"),
    gallery: [img("photo-1612722432474-b971cdcea546")],
    priceBRL: 36900,
    category: "Linho",
    stock: 12,
    rating: 4.9,
    appearances: [{ seriesId: "s4", episode: 8, sceneNote: "Reencontro na praia" }],
  },
  {
    id: "mui2",
    brandId: "br2",
    slug: "macacao-linho-maresia-mui",
    name: "Macacão Linho Coleção Maresia",
    description:
      "Macacão pantalona em linho rústico, decote canoa, cintura com elástico, bolsos laterais.",
    imageUrl: img("photo-1572804013427-4d7ca7268217"),
    gallery: [img("photo-1572804013427-4d7ca7268217")],
    priceBRL: 38900,
    category: "Linho",
    stock: 8,
    rating: 4.8,
    appearances: [{ seriesId: "s2", sceneNote: "Luna no encontro com o conselho" }],
  },
  {
    id: "mui3",
    brandId: "br2",
    slug: "camisa-bordada-lua-mui",
    name: "Camisa Bordada Coleção Lua",
    description:
      "Camisa em linho off-white com bordado floral à mão na gola e punhos. Caimento solto.",
    imageUrl: img("photo-1490481651871-ab68de25d43d"),
    gallery: [img("photo-1490481651871-ab68de25d43d")],
    priceBRL: 24900,
    oldPriceBRL: 29900,
    category: "Linho",
    stock: 21,
    rating: 4.7,
    appearances: [{ seriesId: "s12", sceneNote: "Café da manhã na pousada" }],
  },
  {
    id: "mui4",
    brandId: "br2",
    slug: "saia-longa-amarela-mui",
    name: "Saia Longa Amarelo Maresia",
    description:
      "Saia longa godê em linho amarelo solar, cintura alta, fenda lateral discreta.",
    imageUrl: img("photo-1515886657613-9f3515b0c78f"),
    gallery: [img("photo-1515886657613-9f3515b0c78f")],
    priceBRL: 28900,
    category: "Linho",
    stock: 14,
    rating: 4.6,
    appearances: [{ seriesId: "s10", sceneNote: "Cerimônia do casamento alfa" }],
  },

  // ═══════════════════════════════════════════════════════════════
  // O AMIGÃO — supermercado / cesta premium
  // ═══════════════════════════════════════════════════════════════
  {
    id: "am1",
    brandId: "br3",
    slug: "cesta-gourmet-vinho-queijos-amigao",
    name: "Cesta Gourmet — Vinho + Queijos",
    description:
      "Cesta com vinho tinto reserva, 4 queijos finos, geleias artesanais, biscoitos amanteigados e azeite extra-virgem. Embalagem de presente.",
    imageUrl: img("photo-1547595628-c61a29f496f0"),
    gallery: [img("photo-1547595628-c61a29f496f0")],
    priceBRL: 29900,
    oldPriceBRL: 36900,
    category: "Cesta Premium",
    stock: 25,
    rating: 4.9,
    appearances: [{ seriesId: "s1", episode: 4, sceneNote: "Jantar do Conselho" }],
  },
  {
    id: "am2",
    brandId: "br3",
    slug: "kit-churrasco-premium-amigao",
    name: "Kit Churrasco Premium 5kg",
    description:
      "Picanha + alcatra + linguiça artesanal + queijo coalho + sal grosso. Cortes selecionados Angus, peso total 5kg.",
    imageUrl: img("photo-1558030006-450675393462"),
    gallery: [img("photo-1558030006-450675393462")],
    priceBRL: 39900,
    category: "Cesta Premium",
    stock: 40,
    rating: 4.8,
    appearances: [{ seriesId: "s5", sceneNote: "Churrasco surpresa na cobertura" }],
  },
  {
    id: "am3",
    brandId: "br3",
    slug: "espumante-brasileiro-amigao",
    name: "Espumante Brasileiro Brut Reserva",
    description:
      "Espumante Brut de chardonnay e pinot noir, método tradicional, safra reserva. 750ml.",
    imageUrl: img("photo-1547595628-c61a29f496f0"),
    gallery: [img("photo-1547595628-c61a29f496f0")],
    priceBRL: 8990,
    category: "Cesta Premium",
    stock: 120,
    rating: 4.7,
    appearances: [
      { seriesId: "s9", sceneNote: "Comemoração após a revelação" },
      { seriesId: "s1" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // TUBARÃO ATACADÃO — eletro + utilidades atacarejo
  // ═══════════════════════════════════════════════════════════════
  {
    id: "tb1",
    brandId: "br4",
    slug: "smart-tv-50-4k-tubarao",
    name: 'Smart TV 50" 4K HDR',
    description:
      'TV 50" 4K HDR, sistema Android TV, Wi-Fi, 3 HDMI. Chromecast embutido.',
    imageUrl: img("photo-1593359677879-a4bb92f829d1"),
    gallery: [img("photo-1593359677879-a4bb92f829d1")],
    priceBRL: 219900,
    oldPriceBRL: 279900,
    category: "Eletrônico",
    stock: 18,
    rating: 4.7,
    appearances: [{ seriesId: "s5", sceneNote: "Sala da cobertura" }],
  },
  {
    id: "tb2",
    brandId: "br4",
    slug: "aspirador-robo-tubarao",
    name: "Aspirador Robô Inteligente Wi-Fi",
    description:
      "Robô aspirador 2200Pa, mapeamento a laser, controle pelo app, 120min bateria, recarga automática.",
    imageUrl: img("photo-1567013127542-490d757e51fc"),
    gallery: [img("photo-1567013127542-490d757e51fc")],
    priceBRL: 89900,
    oldPriceBRL: 129900,
    category: "Eletrônico",
    stock: 28,
    rating: 4.6,
    appearances: [{ seriesId: "s8", sceneNote: "Escritório da CEO" }],
  },
  {
    id: "tb3",
    brandId: "br4",
    slug: "cafeteira-italiana-cobre-tubarao",
    name: "Cafeteira Italiana Cobre 6 Xícaras",
    description:
      "Cafeteira Moka clássica em alumínio com acabamento cobre, 6 xícaras. Indução compatível.",
    imageUrl: img("photo-1517701604599-bb29b565090c"),
    gallery: [img("photo-1517701604599-bb29b565090c")],
    priceBRL: 11990,
    category: "Cafeteira",
    stock: 80,
    rating: 4.5,
    appearances: [{ seriesId: "s1", sceneNote: "Café da manhã do casal" }],
  },
  {
    id: "tb4",
    brandId: "br4",
    slug: "air-fryer-12l-tubarao",
    name: "Air Fryer 12L Família",
    description:
      "Fritadeira sem óleo 12 litros, painel digital, 8 funções pré-programadas, cesto removível antiaderente.",
    imageUrl: img("photo-1626806787461-102c1bfaaea1"),
    gallery: [img("photo-1626806787461-102c1bfaaea1")],
    priceBRL: 49900,
    oldPriceBRL: 69900,
    category: "Eletrônico",
    stock: 45,
    rating: 4.8,
    appearances: [{ seriesId: "s11", sceneNote: "Cozinha da nova casa" }],
  },

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
    imageUrl: img("photo-1566174053879-31528523f8ae"),
    gallery: [img("photo-1566174053879-31528523f8ae")],
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
    imageUrl: img("photo-1517701604599-bb29b565090c"),
    gallery: [img("photo-1517701604599-bb29b565090c")],
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
