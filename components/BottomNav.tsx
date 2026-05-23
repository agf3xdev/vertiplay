"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ShoppingBag, Gift, User } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/browse", label: "Descobrir", icon: Compass },
  { href: "/shop", label: "Loja", icon: ShoppingBag },
  { href: "/rewards", label: "Prêmios", icon: Gift },
  { href: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  // esconder no player full-screen e em checkout para não atrapalhar
  const hidden =
    pathname?.startsWith("/series/") ||
    pathname?.startsWith("/watch/") ||
    pathname?.startsWith("/checkout");
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-40 bg-[rgba(10,6,18,0.92)] border-t border-white/5 backdrop-blur-md">
      <ul className="grid grid-cols-5 px-1 py-2">
        {items.map((it) => {
          const active =
            it.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(it.href);
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-1.5 rounded-xl transition",
                  active ? "text-white" : "text-white/55"
                )}
              >
                <Icon
                  className={cn("w-6 h-6", active && "drop-shadow-[0_0_8px_rgba(255,46,146,0.6)]")}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={cn("text-[10px] font-medium", active && "vp-gradient-text font-bold")}>
                  {it.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
