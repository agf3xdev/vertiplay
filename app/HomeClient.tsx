"use client";
// Home — hero feed vertical (estilo TikTok) + linhas de descoberta abaixo.
// Inspirado na home do DramaBox (Descobrir/Novo/Rankings) mas mais imersivo.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Flame, Crown, Sparkles, ChevronRight, Play } from "lucide-react";
import { Logo } from "@/components/Logo";
import { CoinBadge } from "@/components/CoinBadge";
import { StoryBanner } from "@/components/StoryBanner";
import { formatViews, type Series } from "@/lib/catalog";
import { cn } from "@/lib/cn";

const TABS = ["Para Você", "Novo", "Rankings", "Bilionário", "Lobisomem", "Máfia"];

export function HomeClient({
  all,
  trending,
  exclusives,
}: {
  all: Series[];
  trending: Series[];
  exclusives: Series[];
}) {
  const [tab, setTab] = useState(TABS[0]);
  const featured = trending[0];
  const list =
    tab === "Para Você"
      ? all
      : tab === "Novo"
      ? all.slice().reverse()
      : tab === "Rankings"
      ? trending
      : all.filter((s) => s.genre === tab);

  return (
    <div className="pb-4">
      {/* Top bar */}
      <header className="px-4 pt-4 pb-3 safe-top flex items-center justify-between sticky top-0 z-30 bg-[var(--color-vp-bg)]/90 backdrop-blur-md">
        <Logo />
        <div className="flex items-center gap-2">
          <CoinBadge />
          <Link
            href="/browse?focus=search"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <Search className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 pb-3">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "whitespace-nowrap py-1 text-sm font-medium transition",
                tab === t ? "text-white" : "text-white/45"
              )}
            >
              {t}
              {tab === t && (
                <span className="block h-0.5 w-6 vp-gradient rounded-full mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hero featured */}
      {featured && (
        <Link
          href={`/series/${featured.slug}`}
          className="block relative mx-4 mt-2 rounded-3xl overflow-hidden aspect-[4/5]"
        >
          <Image
            src={featured.bannerUrl || featured.posterUrl}
            alt={featured.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="vp-gradient px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
              {featured.isExclusive ? "Exclusivo Vertiplay" : "Em Alta"}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-[11px] text-white/85 mb-1">
              <Flame className="w-3.5 h-3.5 text-[var(--color-vp-pink)]" />
              <span>{formatViews(featured.views)} visualizações</span>
              <span>·</span>
              <span>{featured.totalEpisodes} ep.</span>
            </div>
            <h2 className="text-2xl font-extrabold leading-tight mb-1">
              {featured.title}
            </h2>
            <p className="text-sm text-white/80 line-clamp-2 mb-3">
              {featured.synopsis}
            </p>
            <span className="vp-gradient inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold vp-glow">
              <Play className="w-4 h-4 fill-white" /> Assistir agora
            </span>
          </div>
        </Link>
      )}

      {/* Banner UGC — Conte sua história */}
      <StoryBanner />

      {/* Row: Exclusivos */}
      <Section title="Exclusivos Vertiplay" icon={Crown} href="/browse?cat=exclusivo">
        <Row series={exclusives} />
      </Section>

      {/* Row: Mais assistidos */}
      <Section title="Mais assistidos" icon={Flame} href="/browse?cat=trending">
        <Row series={trending} />
      </Section>

      {/* Grid: catalog */}
      <Section title={tab === "Para Você" ? "Descobrir" : tab} icon={Sparkles}>
        <div className="grid grid-cols-3 gap-2 px-4">
          {list.map((s) => (
            <PosterCard key={s.id} series={s} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  icon: any;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-4 mb-2">
        <h3 className="flex items-center gap-2 font-bold">
          <Icon className="w-4 h-4 text-[var(--color-vp-pink)]" />
          {title}
        </h3>
        {href && (
          <Link href={href} className="text-xs text-white/55 flex items-center gap-1">
            Ver tudo <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Row({ series }: { series: Series[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
      {series.map((s) => (
        <Link
          key={s.id}
          href={`/series/${s.slug}`}
          className="shrink-0 w-32"
        >
          <div className="relative w-32 aspect-poster rounded-xl overflow-hidden">
            <Image src={s.posterUrl} alt={s.title} fill className="object-cover" unoptimized />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/90 to-transparent" />
            <span className="absolute bottom-1 left-1.5 text-[10px] flex items-center gap-1">
              <Play className="w-3 h-3 fill-white" /> {formatViews(s.views)}
            </span>
          </div>
          <p className="text-xs font-medium mt-1.5 line-clamp-2">{s.title}</p>
          <p className="text-[10px] text-white/45">{s.genre}</p>
        </Link>
      ))}
    </div>
  );
}

function PosterCard({ series: s }: { series: Series }) {
  return (
    <Link href={`/series/${s.slug}`} className="block">
      <div className="relative aspect-poster rounded-xl overflow-hidden">
        <Image src={s.posterUrl} alt={s.title} fill className="object-cover" unoptimized />
        {s.isExclusive && (
          <span className="absolute top-1 left-1 vp-gradient px-1.5 py-0.5 rounded text-[9px] font-bold">
            EXCL.
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/85 to-transparent" />
        <span className="absolute bottom-1 left-1.5 text-[10px] flex items-center gap-1">
          <Play className="w-3 h-3 fill-white" /> {formatViews(s.views)}
        </span>
      </div>
      <p className="text-[11px] font-medium mt-1 line-clamp-2 leading-tight">{s.title}</p>
      <p className="text-[10px] text-white/45">{s.genre}</p>
    </Link>
  );
}
