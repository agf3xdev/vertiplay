"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

// Decide o chrome (frame mobile + BottomNav) ou fullscreen (admin / landing pages externas).
// Mantemos client-side pra evitar mover todas as rotas pra um Route Group.
const FULLSCREEN_ROUTES = ["/admin", "/roteiristas"];

// roteiristas.vertiplay.com.br reescreve "/" pra "/roteiristas" no middleware
// (server-side) — usePathname() não reflete rewrites, só a URL da barra de
// endereço, que nesse host continua sendo "/". Checamos o hostname aqui
// também. Como a página /roteiristas é estática, o HTML gerado no build já
// nasce sem o mobile-frame (o path de build é literalmente "/roteiristas");
// o initializer preguiçoso do useState roda já na primeira renderização do
// client (não precisa de useEffect) e bate com esse HTML, sem flash.
const FULLSCREEN_HOSTS = ["roteiristas.vertiplay.com.br"];

export function RootShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";
  const [isFullscreenHost] = useState(
    () => typeof window !== "undefined" && FULLSCREEN_HOSTS.includes(window.location.hostname)
  );

  const isFullscreen =
    isFullscreenHost ||
    FULLSCREEN_ROUTES.some((r) => path === r || path.startsWith(r + "/"));

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
