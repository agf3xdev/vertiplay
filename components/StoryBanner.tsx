"use client";
import Link from "next/link";
import { Sparkles, ArrowRight, Smartphone } from "lucide-react";

export function StoryBanner() {
  return (
    <Link
      href="/conte-sua-historia"
      className="block mx-4 mt-6 rounded-3xl overflow-hidden relative vp-glow"
    >
      <div className="vp-gradient p-5 relative">
        {/* Stars background */}
        <div className="absolute inset-0 opacity-30">
          <Sparkles className="absolute top-3 left-6 w-4 h-4 text-white" />
          <Sparkles className="absolute top-10 right-10 w-3 h-3 text-white" />
          <Sparkles className="absolute bottom-4 left-12 w-5 h-5 text-white" />
          <Sparkles className="absolute bottom-10 right-6 w-3 h-3 text-white" />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/85 mb-0.5">
              Vertiplay convida
            </p>
            <h3 className="text-base font-extrabold leading-tight">
              A sua história na palma da sua mão
            </h3>
            <p className="text-xs text-white/85 mt-1">
              Conte sua história. Pode virar a próxima novela.
            </p>
          </div>

          <ArrowRight className="w-5 h-5 shrink-0" />
        </div>
      </div>
    </Link>
  );
}
