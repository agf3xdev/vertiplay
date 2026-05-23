"use client";
import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Send, Gift, Tv, Coins, Crown, ShoppingBag, Search, Check } from "lucide-react";
import { findUser, MOCK_USERS, type GiftKind } from "@/lib/social";
import { findSeries, SERIES, COIN_PACKS, VIP_PLANS, formatBRL } from "@/lib/catalog";
import { findProductBySlug, PRODUCTS } from "@/lib/shop";
import { useWallet } from "@/lib/store";
import { cn } from "@/lib/cn";

export default function GiftSendPage() {
  return (
    <Suspense>
      <SendInner />
    </Suspense>
  );
}

function SendInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialTo = sp.get("to") ?? "";
  const initialKind = (sp.get("kind") as GiftKind | null) ?? "series";
  const initialPayload = sp.get("payload") ?? "";

  const friends = useWallet((s) => s.friends);
  const sendGift = useWallet((s) => s.sendGift);

  const [step, setStep] = useState<"who" | "what" | "msg" | "done">(
    initialTo ? "what" : "who"
  );
  const [to, setTo] = useState(initialTo);
  const [kind, setKind] = useState<GiftKind>(initialKind);
  const [payload, setPayload] = useState<string>(initialPayload);
  const [message, setMessage] = useState("");
  const [q, setQ] = useState("");

  const friendUsers = MOCK_USERS.filter((u) => friends.includes(u.username));
  const filtered = q
    ? friendUsers.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q.toLowerCase()) ||
          u.username.toLowerCase().includes(q.toLowerCase())
      )
    : friendUsers;

  const recipient = to ? findUser(to) : undefined;

  function buildGift() {
    const base: any = { to, kind, message: message.trim() || undefined };
    if (kind === "series") base.seriesSlug = payload;
    else if (kind === "episode") {
      const [slug, num] = payload.split(":");
      base.seriesSlug = slug;
      base.episodeNumber = parseInt(num, 10);
    } else if (kind === "coins") base.coinsAmount = parseInt(payload, 10);
    else if (kind === "vip") base.vipDays = parseInt(payload, 10);
    else if (kind === "product") base.productSlug = payload;
    return base;
  }

  function finish() {
    sendGift(buildGift());
    setStep("done");
  }

  // ── DONE ──
  if (step === "done") {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center safe-top">
        <div className="w-24 h-24 rounded-full vp-gradient flex items-center justify-center vp-glow mb-5">
          <Send className="w-11 h-11" />
        </div>
        <h1 className="text-2xl font-extrabold mb-1">Presente enviado!</h1>
        <p className="text-sm text-white/65">
          {recipient?.displayName ?? to} vai receber agora.
        </p>
        <div className="flex gap-2 mt-8 w-full max-w-xs">
          <button
            onClick={() => router.push("/gifts")}
            className="flex-1 vp-gradient py-3.5 rounded-2xl font-bold vp-glow"
          >
            Ver presentes
          </button>
          <button
            onClick={() => router.push("/friends")}
            className="flex-1 bg-white/10 py-3.5 rounded-2xl font-bold"
          >
            Amigos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="px-4 pt-4 safe-top flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Enviar presente</h1>
      </div>

      {/* progress */}
      <div className="px-4 flex gap-2 mb-5">
        {(["who", "what", "msg"] as const).map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full",
              ["who", "what", "msg"].indexOf(step) >= i ? "vp-gradient" : "bg-white/15"
            )}
          />
        ))}
      </div>

      {/* STEP 1 — quem */}
      {step === "who" && (
        <div className="px-4">
          <h2 className="font-bold mb-1">Pra quem?</h2>
          <p className="text-xs text-white/55 mb-4">Escolha um amigo da sua lista</p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar amigo"
              className="w-full bg-white/8 border border-white/10 rounded-2xl pl-10 pr-3 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-white/55 text-sm py-12">
              Você ainda não tem amigos. <a href="/friends" className="underline">Adicione amigos</a> primeiro.
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((u) => (
                <li key={u.username}>
                  <button
                    onClick={() => {
                      setTo(u.username);
                      setStep("what");
                    }}
                    className="vp-card rounded-2xl p-3 flex items-center gap-3 w-full text-left"
                  >
                    <Image src={u.avatarUrl} alt="" width={44} height={44} className="w-11 h-11 rounded-full" unoptimized />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{u.displayName}</p>
                      <p className="text-xs text-white/55">@{u.username}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* STEP 2 — o que */}
      {step === "what" && (
        <div className="px-4">
          {recipient && (
            <div className="vp-card rounded-2xl p-3 flex items-center gap-3 mb-5">
              <Image src={recipient.avatarUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-full" unoptimized />
              <div className="flex-1">
                <p className="text-[11px] text-white/55">Presenteando</p>
                <p className="font-semibold text-sm">{recipient.displayName}</p>
              </div>
              <button onClick={() => setStep("who")} className="text-xs underline text-white/65">Trocar</button>
            </div>
          )}

          <h2 className="font-bold mb-1">O que enviar?</h2>
          <p className="text-xs text-white/55 mb-4">Escolha o tipo de presente</p>

          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { id: "series" as const, label: "Série", Icon: Tv },
              { id: "coins" as const, label: "Coins", Icon: Coins },
              { id: "vip" as const, label: "VIP", Icon: Crown },
              { id: "product" as const, label: "Produto", Icon: ShoppingBag },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setKind(opt.id); setPayload(""); }}
                className={cn(
                  "rounded-2xl p-3 flex flex-col items-center gap-1.5 border",
                  kind === opt.id ? "vp-gradient border-transparent" : "vp-card border-white/10"
                )}
              >
                <opt.Icon className="w-4 h-4" />
                <span className="text-[11px] font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* picker dinâmico */}
          {kind === "series" && (
            <PickerList
              items={SERIES.slice(0, 8).map((s) => ({
                value: s.slug,
                title: s.title,
                subtitle: s.genre,
                img: s.posterUrl,
              }))}
              picked={payload}
              onPick={setPayload}
            />
          )}
          {kind === "coins" && (
            <div className="grid grid-cols-2 gap-2">
              {COIN_PACKS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPayload(String(p.coins))}
                  className={cn(
                    "rounded-2xl p-3 text-left border",
                    payload === String(p.coins) ? "vp-gradient border-transparent" : "vp-card border-white/10"
                  )}
                >
                  <p className="text-2xl font-extrabold">{p.coins}</p>
                  <p className="text-[11px] text-white/75">coins · {formatBRL(p.priceBRL)}</p>
                </button>
              ))}
            </div>
          )}
          {kind === "vip" && (
            <div className="space-y-2">
              {VIP_PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPayload(String(p.days))}
                  className={cn(
                    "rounded-2xl p-3 text-left border w-full flex justify-between items-center",
                    payload === String(p.days) ? "vp-gradient border-transparent" : "vp-card border-white/10"
                  )}
                >
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-[11px] text-white/65">{p.days} dias</p>
                  </div>
                  <p className="font-bold">{formatBRL(p.priceBRL)}</p>
                </button>
              ))}
            </div>
          )}
          {kind === "product" && (
            <PickerList
              items={PRODUCTS.slice(0, 12).map((p) => ({
                value: p.slug,
                title: p.name,
                subtitle: formatBRL(p.priceBRL),
                img: p.imageUrl,
              }))}
              picked={payload}
              onPick={setPayload}
            />
          )}

          <button
            disabled={!payload}
            onClick={() => setStep("msg")}
            className={cn(
              "w-full py-3.5 rounded-2xl font-bold mt-5",
              payload ? "vp-gradient vp-glow" : "bg-white/10 text-white/45"
            )}
          >
            Continuar
          </button>
        </div>
      )}

      {/* STEP 3 — mensagem */}
      {step === "msg" && (
        <div className="px-4">
          <h2 className="font-bold mb-1">Mensagem (opcional)</h2>
          <p className="text-xs text-white/55 mb-4">Adicione um recado pra acompanhar</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={280}
            placeholder="Ex: você PRECISA assistir essa cena 😱"
            className="w-full bg-white/8 border border-white/10 rounded-2xl p-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)] resize-none"
          />
          <p className="text-[10px] text-white/45 text-right mt-1">{message.length} / 280</p>
        </div>
      )}

      {/* CTA fixo */}
      {step !== "who" && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-30 bg-[rgba(10,6,18,0.95)] border-t border-white/8 px-4 py-3 backdrop-blur-md">
          {step === "msg" ? (
            <button onClick={finish} disabled={!to || !payload} className="w-full py-4 rounded-2xl vp-gradient vp-glow font-bold flex items-center justify-center gap-2">
              <Gift className="w-4 h-4" /> Enviar presente
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function PickerList({
  items, picked, onPick,
}: {
  items: { value: string; title: string; subtitle: string; img: string }[];
  picked: string;
  onPick: (v: string) => void;
}) {
  return (
    <ul className="space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
      {items.map((it) => (
        <li key={it.value}>
          <button
            onClick={() => onPick(it.value)}
            className={cn(
              "w-full vp-card rounded-2xl p-2 flex items-center gap-3 border text-left",
              picked === it.value ? "border-[var(--color-vp-pink)]" : "border-transparent"
            )}
          >
            <Image src={it.img} alt="" width={48} height={48} className="w-12 h-12 rounded-xl object-cover" unoptimized />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-1">{it.title}</p>
              <p className="text-[11px] text-white/55">{it.subtitle}</p>
            </div>
            {picked === it.value && <Check className="w-4 h-4 text-[var(--color-vp-pink)]" />}
          </button>
        </li>
      ))}
    </ul>
  );
}
