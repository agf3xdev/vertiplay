import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Vertiplay — Novelas curtas no seu bolso",
  description:
    "Vertiplay é o app de mini-novelas verticais. Episódios de 60-90s, paixão, drama e reviravoltas — assista de qualquer lugar.",
  applicationName: "Vertiplay",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Vertiplay" },
  openGraph: {
    title: "Vertiplay",
    description: "Mini-novelas verticais. Drama em 60 segundos.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0612",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="mobile-frame">
          <main className="pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
