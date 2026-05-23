"use client";
import Link from "next/link";
import { Gift } from "lucide-react";

type Props = {
  kind: "series" | "episode" | "product";
  payload: string;
  className?: string;
  size?: "sm" | "md";
};

export function GiftButton({ kind, payload, className, size = "md" }: Props) {
  const href = `/gifts/send?kind=${kind}&payload=${encodeURIComponent(payload)}`;
  const sm = size === "sm";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 ${sm ? "px-2.5 py-1 text-[11px]" : "px-3 py-2 text-xs"} vp-gradient rounded-full font-bold ${className ?? ""}`}
    >
      <Gift className={sm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      Presentear
    </Link>
  );
}
