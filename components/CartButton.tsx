"use client";
import { useWallet } from "@/lib/store";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export function CartButton() {
  const count = useWallet((s) => s.cart.reduce((a, l) => a + l.qty, 0));
  return (
    <Link href="/cart" className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 vp-gradient text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
