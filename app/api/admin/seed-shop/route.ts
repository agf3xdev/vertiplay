// Importa todo o catálogo in-memory (lib/catalog.ts + lib/shop.ts) pra Postgres
// para que o admin possa listar/editar/excluir tudo via UI.
// Idempotente: upsert por slug em Series, Brand e Product.
// ProductAppearance: cria apenas se ainda não houver (productId, seriesId, episodeId).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";
import { SERIES } from "@/lib/catalog";
import { BRANDS, PRODUCTS } from "@/lib/shop";

export async function POST() {
  const g = await gate();
  if (g) return g;

  // 1. Séries (+ episódios)
  const seriesIdMap = new Map<string, string>(); // "s1" → cuid
  for (const s of SERIES) {
    const created = await prisma.series.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        title: s.title,
        synopsis: s.synopsis,
        posterUrl: s.posterUrl,
        bannerUrl: s.bannerUrl,
        genre: s.genre,
        tags: s.tags.join(","),
        isExclusive: s.isExclusive,
        isFeatured: s.isFeatured,
        views: s.views,
        rating: s.rating,
        totalEpisodes: s.totalEpisodes,
        freeEpisodes: s.freeEpisodes,
      },
    });
    seriesIdMap.set(s.id, created.id);

    // Episódios — só seedamos os primeiros 5 pra não inflar o banco
    // (cada série tem 38–90 eps mock; 5 dá pra testar o fluxo no admin)
    for (let i = 0; i < Math.min(s.episodes.length, 5); i++) {
      const ep = s.episodes[i];
      await prisma.episode.upsert({
        where: { seriesId_number: { seriesId: created.id, number: ep.number } },
        update: {},
        create: {
          seriesId: created.id,
          number: ep.number,
          title: ep.title,
          durationSec: ep.durationSec,
          videoUrl: ep.videoUrl,
          thumbUrl: ep.thumbUrl,
          isFree: ep.isFree,
          costCoins: ep.costCoins,
        },
      });
    }
  }

  // 2. Marcas
  const brandIdMap = new Map<string, string>(); // "br1"|"b1" → cuid
  for (const b of BRANDS) {
    const created = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        slug: b.slug,
        name: b.name,
        logoUrl: b.logoUrl,
        coverUrl: b.coverUrl,
        bio: b.bio,
        website: b.website,
        category: b.category,
        isVerified: b.isVerified,
      },
    });
    brandIdMap.set(b.id, created.id);
  }

  // 3. Produtos
  const productIdMap = new Map<string, string>();
  let productsCount = 0;
  let appearancesCount = 0;
  for (const p of PRODUCTS) {
    const dbBrandId = brandIdMap.get(p.brandId);
    if (!dbBrandId) continue; // marca desconhecida — skip

    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        brandId: dbBrandId,
        slug: p.slug,
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        gallery: p.gallery.join(","),
        priceBRL: p.priceBRL,
        oldPriceBRL: p.oldPriceBRL ?? null,
        category: p.category,
        stock: p.stock,
        rating: p.rating,
      },
    });
    productIdMap.set(p.id, created.id);
    productsCount++;

    // Aparições
    for (const a of p.appearances) {
      const dbSeriesId = seriesIdMap.get(a.seriesId);
      if (!dbSeriesId) continue;

      const exists = await prisma.productAppearance.findFirst({
        where: {
          productId: created.id,
          seriesId: dbSeriesId,
          ...(a.episode != null ? {} : {}),
        },
      });
      if (!exists) {
        await prisma.productAppearance.create({
          data: {
            productId: created.id,
            seriesId: dbSeriesId,
            sceneNote: a.sceneNote ?? null,
          },
        });
        appearancesCount++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    series: SERIES.length,
    brands: BRANDS.length,
    products: productsCount,
    appearances: appearancesCount,
  });
}
