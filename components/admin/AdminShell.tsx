"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Film,
  ShoppingBag,
  Tag,
  Megaphone,
  ScrollText,
  Feather,
  Users,
  Wallet,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/series", label: "Séries", icon: Film },
  { href: "/admin/brands", label: "Marcas", icon: Tag },
  { href: "/admin/products", label: "Produtos", icon: ShoppingBag },
  { href: "/admin/campaigns", label: "Campanhas", icon: Megaphone },
  { href: "/admin/stories", label: "Histórias UGC", icon: ScrollText },
  { href: "/admin/writers", label: "Roteiristas", icon: Feather },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/ledger", label: "Ledger", icon: Wallet },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[var(--color-vp-bg)] text-white flex">
      {/* Sidebar mobile overlay */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-64 bg-[var(--color-vp-bg-2)] border-r border-white/8 transition-transform duration-200 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-semibold">Admin</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 pb-4 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== "/admin" && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition mb-0.5",
                  active
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/8">
          <p className="text-[11px] text-white/45">Logado como</p>
          <p className="text-xs font-medium truncate">{email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 w-full py-2 rounded-lg bg-white/10 text-xs flex items-center justify-center gap-2 hover:bg-white/15"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 bg-[var(--color-vp-bg)]/95 backdrop-blur border-b border-white/8 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <Menu className="w-4 h-4" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Logo size={22} />
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/55 font-semibold">Admin</span>
          </Link>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
