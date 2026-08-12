"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

// Decide o chrome (frame mobile + BottomNav) ou fullscreen (admin / landing pages externas).
// Mantemos client-side pra evitar mover todas as rotas pra um Route Group.
const FULLSCREEN_ROUTES = ["/admin", "/roteiristas"];

// roteiristas.vertiplay.com.br reescreve "/" pra "/roteiristas" no middleware
// (server-side) — usePathname() não reflete rewrites, só a URL da barra de
// endereço, que nesse host continua sendo "/". Por isso checamos o hostname
// aqui também. Isso não roda no servidor (evita forçar o app inteiro a virar
// dinâmico só por causa de um subdomínio) — o mobile-frame pode aparecer por
// uma fração de segundo antes do useEffect corrigir.
const FULLSCREEN_HOSTS = ["roteiristas.vertiplay.com.br"];

export function RootShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";
  const [isFullscreenHost, setIsFullscreenHost] = useState(false);
  useEffect(() => {
    setIsFullscreenHost(FULLSCREEN_HOSTS.includes(window.location.hostname));
  }, []);

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
