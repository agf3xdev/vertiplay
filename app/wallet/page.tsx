"use client";
import { useWallet } from "@/lib/store";
import { COIN_PACKS, VIP_PLANS, formatBRL } from "@/lib/catalog";
import { Coins, Crown, Sparkles, ChevronLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

export default function WalletPage() {
  return (
    <Suspense>
      <WalletInner />
    </Suspense>
  );
}

function WalletInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const needed = parseInt(sp.get("need") ?? "0", 10);
  const paid = useWallet((s) => s.coinsPaid);
  const bonus = useWallet((s) => s.coinsBonus);
  const isVip = useWallet((s) => s.isVip);
  const vipExpires = useWallet((s) => s.vipExpiresAt);
  const addCoins = useWallet((s) => s.addCoins);
  const activateVip = useWallet((s) => s.activateVip);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Após retorno do Stripe com ?paid=1, o webhook cuida do crédito no backend.
  // Aqui, no MVP, fazemos um soft-credit visual quando sid presente — em prod, refetch do user.
  useEffect(() => {
    if (sp.get("paid") === "1") {
      const sid = sp.get("sid");
      const pack = sid ? null : null;
      // Lógica real: backend já creditou via webhook → frontend só refeed.
      // Aqui só limpa a query.
      router.replace("/wallet");
    }
  }, [sp, router]);

  const [selected, setSelected] = useState<{ type: "coins" | "vip"; packId: string } | null>(null);

  async function startPayment(method: "mp" | "stripe") {
    if (!selected) return;
    setLoadingId(selected.packId + ":" + method);
    try {
      const endpoint = method === "mp" ? "/api/mp/checkout" : "/api/stripe/checkout";
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });
      const data = await r.json();
      const url = data.url || data.init_point;
      if (url) {
        window.location.href = url;
      } else {
        alert("Erro ao iniciar pagamento: " + (data.error ?? "desconhecido"));
        setLoadingId(null);
      }
    } catch (e) {
      alert("Erro de rede");
      setLoadingId(null);
    }
  }

  return (
    <div className="px-4 pt-4 safe-top pb-8">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Minha Carteira</h1>
      </div>

      {needed > 0 && (
        <div className="vp-card rounded-2xl p-4 mb-4 border border-[var(--color-vp-pink)]/40">
          <p className="font-semibold">Faltam coins!</p>
          <p className="text-sm text-white/70">
            Você precisa de {needed} coins para desbloquear o próximo episódio. Compre abaixo:
          </p>
        </div>
      )}

      {/* Saldo */}
      <div className="vp-card rounded-3xl p-5 vp-glow">
        <div className="flex justify-around mb-4">
          <div className="text-center">
            <p className="text-xs text-white/55 mb-1">Coins</p>
            <p className="text-3xl font-bold flex items-center gap-1 justify-center">
              <Coins className="w-5 h-5 text-[var(--color-vp-gold)]" /> {paid}
            </p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <p className="text-xs text-white/55 mb-1">Coins bônus</p>
            <p className="text-3xl font-bold flex items-center gap-1 justify-center">
              <Sparkles className="w-5 h-5 text-[var(--color-vp-pink)]" /> {bonus}
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/45">
            Bônus são consumidos primeiro nos desbloqueios.
          </p>
        </div>
      </div>

      {isVip && (
        <div className="vp-gradient rounded-3xl p-5 mt-4 vp-glow">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5" />
            <p className="font-bold">Você é VIP Vertiplay</p>
          </div>
          <p className="text-sm text-white/90">
            Acesso ilimitado até {vipExpires ? new Date(vipExpires).toLocaleDateString("pt-BR") : "—"}.
          </p>
        </div>
      )}

      {/* Coin packs */}
      <h3 className="font-bold mt-6 mb-3 flex items-center gap-2">
        <Coins className="w-4 h-4 text-[var(--color-vp-gold)]" /> Pacotes de coins
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {COIN_PACKS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected({ type: "coins", packId: p.id })}
            className={`vp-card rounded-2xl p-4 text-left relative ${
              (p as any).popular ? "border-[var(--color-vp-pink)]/60" : ""
            }`}
          >
            {(p as any).popular && (
              <span className="absolute -top-2 left-3 vp-gradient text-[10px] font-bold px-2 py-0.5 rounded-full">
                MAIS POPULAR
              </span>
            )}
            <p className="text-xs text-white/55">{p.label}</p>
            <p className="text-2xl font-extrabold mt-1">
              {p.coins}
              {p.bonus > 0 && (
                <span className="text-sm text-[var(--color-vp-pink)] ml-1">
                  +{p.bonus}
                </span>
              )}
            </p>
            <p className="text-[11px] text-white/55">coins {p.bonus > 0 && "+ bônus"}</p>
            <p className="mt-2 font-bold vp-gradient-text">{formatBRL(p.priceBRL)}</p>
          </button>
        ))}
      </div>

      {/* VIP */}
      <h3 className="font-bold mt-6 mb-3 flex items-center gap-2">
        <Crown className="w-4 h-4 text-[var(--color-vp-gold)]" /> Assinatura VIP
      </h3>
      <p className="text-xs text-white/55 mb-3">
        Episódios ilimitados, sem anúncios, coins diários e estreias antecipadas.
      </p>
      <div className="space-y-2">
        {VIP_PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected({ type: "vip", packId: p.id })}
            className={`vp-card rounded-2xl p-4 w-full flex justify-between items-center text-left ${
              (p as any).popular ? "border-[var(--color-vp-pink)]/60" : ""
            }`}
          >
            <div>
              <p className="font-bold flex items-center gap-2">
                {p.name}
                {(p as any).popular && (
                  <span className="vp-gradient text-[10px] font-bold px-2 py-0.5 rounded-full">
                    MELHOR
                  </span>
                )}
              </p>
              <p className="text-xs text-white/55 mt-0.5">
                {p.coinsPerDay} coins bônus/dia · {p.days} dias
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold vp-gradient-text">{formatBRL(p.priceBRL)}</p>
              <span className="text-[10px] text-white/55">
                {formatBRL(Math.round(p.priceBRL / p.days))}/dia
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/35 text-center mt-6">
        Pagamentos processados via Stripe e Mercado Pago. Renovação automática que pode ser cancelada a qualquer momento.
      </p>

      {/* Sheet de seleção de método */}
      {selected && (
        <PaymentSheet
          selected={selected}
          loadingId={loadingId}
          onClose={() => setSelected(null)}
          onPay={startPayment}
        />
      )}
    </div>
  );
}

function PaymentSheet({
  selected,
  loadingId,
  onClose,
  onPay,
}: {
  selected: { type: "coins" | "vip"; packId: string };
  loadingId: string | null;
  onClose: () => void;
  onPay: (m: "mp" | "stripe") => void;
}) {
  const pack =
    selected.type === "coins"
      ? COIN_PACKS.find((p) => p.id === selected.packId)
      : VIP_PLANS.find((p) => p.id === selected.packId);
  const price = pack ? formatBRL((pack as any).priceBRL) : "";
  const label =
    selected.type === "coins"
      ? `${(pack as any)?.coins} coins${(pack as any)?.bonus ? ` + ${(pack as any).bonus} bônus` : ""}`
      : (pack as any)?.name;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-[480px] mx-auto bg-[var(--color-vp-bg)] rounded-t-3xl p-5 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-lg mb-1">Escolha o pagamento</h3>
        <p className="text-sm text-white/65 mb-4">
          {label} · <b className="vp-gradient-text">{price}</b>
        </p>

        <button
          onClick={() => onPay("mp")}
          disabled={loadingId !== null}
          className="vp-card rounded-2xl w-full p-4 mb-2 flex items-center gap-3 disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-[#00B1EA] flex items-center justify-center font-bold">
            MP
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">Mercado Pago</p>
            <p className="text-[11px] text-white/55">PIX, cartão, boleto · até 6x</p>
          </div>
          {loadingId === selected.packId + ":mp" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="vp-gradient text-[10px] font-bold px-2 py-0.5 rounded-full">
              Recomendado
            </span>
          )}
        </button>

        <button
          onClick={() => onPay("stripe")}
          disabled={loadingId !== null}
          className="vp-card rounded-2xl w-full p-4 flex items-center gap-3 disabled:opacity-50"
        >
          <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center font-bold">
            S
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">Stripe</p>
            <p className="text-[11px] text-white/55">Cartão internacional</p>
          </div>
          {loadingId === selected.packId + ":stripe" && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
        </button>

        <button onClick={onClose} className="block mx-auto mt-4 text-sm text-white/55">
          Cancelar
        </button>
      </div>
    </div>
  );
}
