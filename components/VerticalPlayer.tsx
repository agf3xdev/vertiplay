"use client";
// Player vertical full-screen — coração do Vertiplay.
// - HLS adaptativo com hls.js (fallback nativo Safari).
// - Tap = play/pause, double tap = like, swipe up/down = ep anterior/próximo.
// - Overlay com info da série, ações (like, watchlist, share, sacolinha shop).
// - Paywall coins quando episódio bloqueado.

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ShoppingBag,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ChevronLeft,
  Coins,
} from "lucide-react";
import { useWallet } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { Series, Episode } from "@/lib/catalog";
import { productsInEpisode } from "@/lib/shop";
import { ShopOverlay } from "./ShopOverlay";

type Props = {
  series: Series;
  episode: Episode;
  onNext?: () => void;
  onPrev?: () => void;
  onUnlocked?: () => void;
};

export function VerticalPlayer({ series, episode, onNext, onPrev, onUnlocked }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [progress, setProgress] = useState(0);
  const isUnlocked = useWallet((s) => s.isUnlocked(series.id, episode.number));
  const isInWatchlist = useWallet((s) => s.isInWatchlist(series.id));
  const toggleWatchlist = useWallet((s) => s.toggleWatchlist);
  const unlock = useWallet((s) => s.unlock);
  const coinsTotal = useWallet((s) => s.coinsPaid + s.coinsBonus);
  const isVip = useWallet((s) => s.isVip);

  const accessible = episode.isFree || isVip || isUnlocked;
  const products = productsInEpisode(series.id, episode.number);

  // HLS bootstrap
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !accessible) return;
    const url = episode.videoUrl;
    let hls: Hls | null = null;
    if (Hls.isSupported() && url.endsWith(".m3u8")) {
      hls = new Hls({ maxBufferLength: 15 });
      hls.loadSource(url);
      hls.attachMedia(v);
    } else {
      v.src = url;
    }
    v.muted = muted;
    v.play().catch(() => setPlaying(false));
    return () => {
      hls?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.videoUrl, accessible]);

  // progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress((v.currentTime / (v.duration || 1)) * 100);
    const onEnd = () => onNext?.();
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnd);
    };
  }, [onNext]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function handleUnlock() {
    const ok = unlock(series.id, episode.number, episode.costCoins);
    if (ok) onUnlocked?.();
    else router.push("/wallet?need=" + episode.costCoins);
  }

  // swipe vertical
  const touchStart = useRef(0);
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dy = e.changedTouches[0].clientY - touchStart.current;
    if (Math.abs(dy) < 60) return;
    if (dy < 0) onNext?.();
    else onPrev?.();
  }

  return (
    <div
      className="relative w-full h-[100dvh] bg-black overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {accessible ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          autoPlay
          muted={muted}
          onClick={togglePlay}
          poster={episode.thumbUrl}
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${series.bannerUrl || series.posterUrl})` }}
        />
      )}

      {/* Top gradient + back button */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/85 to-transparent pointer-events-none" />

      <button
        onClick={() => router.back()}
        className="absolute top-4 left-3 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center safe-top"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute top-4 right-3 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center safe-top"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Play indicator quando pausado */}
      {!playing && accessible && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center z-20"
        >
          <Play className="w-10 h-10" />
        </button>
      )}

      {/* Side actions */}
      <div className="absolute right-3 bottom-32 z-30 flex flex-col gap-5 items-center">
        <button
          onClick={() => setLiked((l) => !l)}
          className="flex flex-col items-center text-white"
        >
          <Heart
            className={cn("w-8 h-8 transition", liked && "fill-[var(--color-vp-pink)] text-[var(--color-vp-pink)]")}
            strokeWidth={2.2}
          />
          <span className="text-xs mt-1">{liked ? "Curtido" : "Curtir"}</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <MessageCircle className="w-8 h-8" strokeWidth={2.2} />
          <span className="text-xs mt-1">Comentar</span>
        </button>
        <button
          onClick={() => toggleWatchlist(series.id)}
          className="flex flex-col items-center text-white"
        >
          <Bookmark
            className={cn("w-8 h-8 transition", isInWatchlist && "fill-white")}
            strokeWidth={2.2}
          />
          <span className="text-xs mt-1">Salvar</span>
        </button>
        {products.length > 0 && (
          <button
            onClick={() => setShowShop(true)}
            className="flex flex-col items-center text-white relative"
          >
            <div className="w-10 h-10 rounded-full vp-gradient flex items-center justify-center vp-glow">
              <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {products.length}
            </span>
            <span className="text-xs mt-1">Da cena</span>
          </button>
        )}
        <button className="flex flex-col items-center text-white">
          <Share2 className="w-8 h-8" strokeWidth={2.2} />
          <span className="text-xs mt-1">Enviar</span>
        </button>
      </div>

      {/* Info da série */}
      <div className="absolute left-3 right-20 bottom-20 z-30 text-white">
        <Link href={`/series/${series.slug}`} className="block">
          <p className="text-xs text-white/80 mb-1">
            {series.genre} • Ep. {episode.number}/{series.totalEpisodes}
          </p>
          <h3 className="font-bold text-lg leading-tight">{series.title}</h3>
          <p className="text-sm text-white/85 mt-1 line-clamp-2">{series.synopsis}</p>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="absolute left-3 right-3 bottom-16 h-0.5 bg-white/20 rounded-full overflow-hidden z-30">
        <div className="h-full vp-gradient" style={{ width: `${progress}%` }} />
      </div>

      {/* Paywall */}
      {!accessible && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full vp-gradient flex items-center justify-center vp-glow mb-5">
            <Coins className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-bold mb-1">Desbloquear episódio {episode.number}</h3>
          <p className="text-white/70 text-sm mb-6">
            Continue a história com {episode.costCoins} coins
          </p>
          <button
            onClick={handleUnlock}
            disabled={coinsTotal < episode.costCoins}
            className="vp-gradient w-full max-w-xs py-4 rounded-2xl font-bold text-lg vp-glow disabled:opacity-40"
          >
            {coinsTotal < episode.costCoins
              ? "Coins insuficientes"
              : `Desbloquear · ${episode.costCoins} coins`}
          </button>
          <Link
            href="/wallet"
            className="mt-4 text-sm text-white/70 underline underline-offset-4"
          >
            Comprar coins
          </Link>
          <p className="mt-2 text-xs text-white/40">
            Você tem {coinsTotal} coins (pagas + bônus)
          </p>
        </div>
      )}

      {showShop && (
        <ShopOverlay
          products={products}
          seriesTitle={series.title}
          onClose={() => setShowShop(false)}
        />
      )}
    </div>
  );
}
