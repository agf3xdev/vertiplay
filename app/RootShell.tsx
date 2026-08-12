"use client";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

// Decide o chrome (frame mobile + BottomNav) ou fullscreen (admin / landing pages externas).
// Mantemos client-side pra evitar mover todas as rotas pra um Route Group.
const FULLSCREEN_ROUTES = ["/admin", "/roteiristas"];

export function RootShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";
  const isFullscreen = FULLSCREEN_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-frame">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
