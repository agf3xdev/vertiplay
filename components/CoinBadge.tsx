"use client";
import { useWallet } from "@/lib/store";
import Link from "next/link";
import { Coins } from "lucide-react";

export function CoinBadge() {
  const paid = useWallet((s) => s.coinsPaid);
  const bonus = useWallet((s) => s.coinsBonus);
  return (
    <Link
      href="/wallet"
      className="vp-card px-3 py-1.5 rounded-full flex items-center gap-2 text-sm"
    >
      <Coins className="w-4 h-4 text-[var(--color-vp-gold)]" />
      <span className="font-semibold">{paid + bonus}</span>
    </Link>
  );
}
