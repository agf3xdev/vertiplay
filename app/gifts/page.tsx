"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Gift, Inbox, Send, CheckCircle2, Sparkles } from "lucide-react";
import { findUser, describeGift, giftEmoji } from "@/lib/social";
import { findSeries } from "@/lib/catalog";
import { findProductBySlug } from "@/lib/shop";
import { useWallet } from "@/lib/store";
import { cn } from "@/lib/cn";

export default function GiftsPage() {
  const router = useRouter();
  const received = useWallet((s) => s.giftsReceived);
  const sent = useWallet((s) => s.giftsSent);
  const claimGift = useWallet((s) => s.claimGift);
  const [tab, setTab] = useState<"recebidos" | "enviados">("recebidos");
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="pb-8">
      <div className="px-4 pt-4 safe-top flex items-center gap-3 mb-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2 flex-1">
          <Gift className="w-5 h-5 text-[var(--color-vp-pink)]" /> Presentes
        </h1>
        <Link href="/friends" className="text-xs text-white/65 underline">Amigos</Link>
      </div>

      <div className="px-4 flex gap-6 border-b border-white/10 mb-3">
        {([
          ["recebidos", `Recebidos · ${received.length}`, Inbox],
          ["enviados", `Enviados · ${sent.length}`, Send],
        ] as const).map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "py-2 text-sm font-medium border-b-2 transition flex items-center gap-1.5",
              tab === k ? "border-[var(--color-vp-pink)] text-white" : "border-transparent text-white/55"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {(tab === "recebidos" ? received : sent).map((g) => {
          const otherUser = tab === "recebidos" ? findUser(g.from) : findUser(g.to);
          const series = g.seriesSlug ? findSeries(g.seriesSlug) : undefined;
          const product = g.productSlug ? findProductBySlug(g.productSlug) : undefined;
          const isClaimed = g.status === "claimed";

          return (
            <div key={g.id} className={cn("vp-card rounded-2xl p-4", isClaimed && "opacity-65")}>
              <div className="flex items-start gap-3">
                {otherUser ? (
                  <Image src={otherUser.avatarUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-full" unoptimized />
                ) : (
                  <div className="w-12 h-12 rounded-full vp-gradient flex items-center justify-center text-2xl">
                    {giftEmoji(g.kind)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {tab === "recebidos" ? (
                      <>
                        <span className="font-bold">{otherUser?.displayName ?? g.from}</span>{" "}
                        te enviou {giftEmoji(g.kind)}
                      </>
                    ) : (
                      <>
                        Você enviou pra <span className="font-bold">{otherUser?.displayName ?? g.to}</span> {giftEmoji(g.kind)}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-white/55 mt-0.5">{describeGift(g)}</p>
                  {series && (
                    <Link href={`/series/${series.slug}`} className="block mt-2 text-xs vp-gradient-text font-semibold">
                      → {series.title}
                    </Link>
                  )}
                  {product && (
                    <Link href={`/shop/product/${product.slug}`} className="block mt-2 text-xs vp-gradient-text font-semibold">
                      → {product.name}
                    </Link>
                  )}
                  {g.message && (
                    <div className="mt-2 vp-card rounded-xl p-2 text-xs italic text-white/85">
                      "{g.message}"
                    </div>
                  )}
                  <p className="text-[10px] text-white/40 mt-2">
                    {new Date(g.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              {tab === "recebidos" && (
                isClaimed ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-vp-pink)]">
                    <CheckCircle2 className="w-4 h-4" /> Resgatado
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      claimGift(g.id);
                      setLast(g.id);
                    }}
                    className="mt-3 w-full vp-gradient py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 vp-glow"
                  >
                    <Sparkles className="w-4 h-4" /> Resgatar presente
                  </button>
                )
              )}

              {last === g.id && (
                <div className="mt-2 text-xs text-[var(--color-vp-pink)] flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3 h-3" /> Aplicado na sua conta!
                </div>
              )}
            </div>
          );
        })}

        {(tab === "recebidos" ? received : sent).length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full vp-gradient flex items-center justify-center mx-auto mb-3 vp-glow">
              <Gift className="w-7 h-7" />
            </div>
            <p className="font-bold">
              {tab === "recebidos" ? "Nenhum presente ainda" : "Você não enviou presentes"}
            </p>
            <p className="text-xs text-white/55 mt-1 mb-4">
              {tab === "recebidos"
                ? "Quando um amigo te enviar algo, aparece aqui."
                : "Envie séries, coins ou produtos pros seus amigos."}
            </p>
            <Link href="/friends" className="vp-gradient inline-block px-5 py-2.5 rounded-2xl text-sm font-bold">
              Ver amigos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
