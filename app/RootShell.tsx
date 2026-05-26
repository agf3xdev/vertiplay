"use client";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

// Decide o chrome (frame mobile + BottomNav) ou fullscreen (admin).
// Mantemos client-side pra evitar mover todas as rotas pra um Route Group.
export function RootShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";
  const isAdmin = path.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-frame">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
