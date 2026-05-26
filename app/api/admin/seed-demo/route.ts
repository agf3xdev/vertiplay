// Cria uma série demo completa pra validar pipeline ponta-a-ponta:
// 1 série + 10 episódios (3 grátis, 7 a 20 coins) + 1 marca + 3 produtos + 3 aparições + 1 patrocínio.
// Idempotente: usa upsert por slug.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";

const SERIES_SLUG = "hotel-das-sombras";
const BRAND_SLUG = "primus-rio-demo";

const VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

const EP_TITLES = [
  "O encontro proibido",
  "A herdeira sumiu",
  "Trato fechado",
  "Sangue no espelho",
  "Quem te mandou?",
  "A verdade do quinto andar",
  "Pacto de silêncio",
  "Não foi acidente",
  "O retorno dela",
  "Última noite",
];

const POSTERS = {
  series: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800",
  banner: "https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=1600",
  thumbs: [
    "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=600",
    "https://images.unsplash.com/photo-1521120098171-1ad15d0fb70a?w=600",
    "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600",
    "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600",
    "https://images.unsplash.com/photo-1517928260182-e3da9a7f8c10?w=600",
    "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600",
    "https://images.unsplash.com/photo-1485217988980-11786ced9454?w=600",
    "https://images.unsplash.com/photo-1559521783-1d1599583485?w=600",
    "https://images.unsplash.com/photo-1490131784822-ea7c5e3e2c14?w=600",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600",
  ],
};

const BRAND = {
  name: "Primus Rio (Demo)",
  logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200",
  coverUrl: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=1200",
  bio: "Marca de luxo carioca. Loja patrocinadora demo pra teste do pipeline shoppable.",
  category: "Moda",
};

const PRODUCTS = [
  {
    name: "Vestido midi seda preta",
    description: "Vestido usado pela Helena na cena do hotel. Seda 100%, modelagem reta.",
    imageUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600",
    priceBRL: 89900,
    oldPriceBRL: 129900,
    category: "Vestido",
    sceneNote: "Vestido da Helena no episódio 1 (jantar)",
  },
  {
    name: "Relógio dourado vintage",
    description: "Réplica do relógio do antagonista. Aço escovado dourado, pulseira de couro.",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
    priceBRL: 79900,
    category: "Relógio",
    sceneNote: "Relógio do Marco na cena do espelho",
  },
  {
    name: "Bolsa carteira couro",
    description: "Inspirada na cena do quinto andar. Couro legítimo, alça removível.",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
    priceBRL: 49900,
    oldPriceBRL: 69900,
    category: "Outros",
    sceneNote: "Bolsa da Helena no episódio 6",
  },
];

export async function POST() {
  const g = await gate();
  if (g) return g;

  // 1. Série
  const series = await prisma.series.upsert({
    where: { slug: SERIES_SLUG },
    update: {},
    create: {
      slug: SERIES_SLUG,
      title: "Hotel das Sombras",
      synopsis:
        "Helena, herdeira de uma fortuna no Rio, descobre que o desaparecimento da irmã está ligado ao bilionário Marco Vianna, dono do hotel mais luxuoso da Zona Sul. Pra desvendar a verdade, ela aceita um emprego no hotel — e se vê em uma teia de paixão, traição e segredos guardados a sete chaves.",
      posterUrl: POSTERS.series,
      bannerUrl: POSTERS.banner,
      genre: "CEO",
      tags: "bilionario,vinganca,paixao,heranca,hotel",
      isFeatured: true,
      isExclusive: true,
      freeEpisodes: 3,
      totalEpisodes: 10,
      views: 24300,
      rating: 4.8,
    },
  });

  // 2. Episódios
  for (let i = 0; i < EP_TITLES.length; i++) {
    const number = i + 1;
    await prisma.episode.upsert({
      where: { seriesId_number: { seriesId: series.id, number } },
      update: {
        title: EP_TITLES[i],
        videoUrl: VIDEOS[i],
        thumbUrl: POSTERS.thumbs[i],
      },
      create: {
        seriesId: series.id,
        number,
        title: EP_TITLES[i],
        videoUrl: VIDEOS[i],
        thumbUrl: POSTERS.thumbs[i],
        durationSec: 75,
        costCoins: 20,
        isFree: number <= 3,
      },
    });
  }

  // 3. Marca
  const brand = await prisma.brand.upsert({
    where: { slug: BRAND_SLUG },
    update: {},
    create: {
      slug: BRAND_SLUG,
      name: BRAND.name,
      logoUrl: BRAND.logoUrl,
      coverUrl: BRAND.coverUrl,
      bio: BRAND.bio,
      category: BRAND.category,
      isVerified: true,
    },
  });

  // 4. Produtos + aparições
  for (const p of PRODUCTS) {
    const slug = p.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        brandId: brand.id,
        slug,
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        gallery: p.imageUrl,
        priceBRL: p.priceBRL,
        oldPriceBRL: p.oldPriceBRL ?? null,
        category: p.category,
        stock: 50,
        rating: 4.7,
      },
    });
    // Aparição (não tem unique — só cria se não existir um igual)
    const existing = await prisma.productAppearance.findFirst({
      where: { productId: product.id, seriesId: series.id },
    });
    if (!existing) {
      await prisma.productAppearance.create({
        data: {
          productId: product.id,
          seriesId: series.id,
          sceneNote: p.sceneNote,
        },
      });
    }
  }

  // 5. Patrocínio
  await prisma.seriesSponsorship.upsert({
    where: { brandId_seriesId: { brandId: brand.id, seriesId: series.id } },
    update: { tier: "headline" },
    create: {
      brandId: brand.id,
      seriesId: series.id,
      tier: "headline",
    },
  });

  return NextResponse.json({
    ok: true,
    series: { id: series.id, slug: series.slug, title: series.title },
    brandId: brand.id,
    products: PRODUCTS.length,
  });
}
