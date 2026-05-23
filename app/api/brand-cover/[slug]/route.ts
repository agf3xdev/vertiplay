// Cover banner SVG por marca (1600x600) — header da brand page
import { NextRequest } from "next/server";
import { findBrandBySlug } from "@/lib/shop";

const BRAND_COLORS: Record<string, [string, string, string]> = {
  "primus-rio": ["#0a2a5c", "#3a8aff", "#aaccff"],
  mui: ["#d4c4a0", "#8a7a5a", "#1a3a6a"],
  "o-amigao": ["#0c7a3a", "#3aaa5a", "#ffd700"],
  "tubarao-atacadao": ["#0a1a3a", "#1a3a6a", "#ffaa00"],
  "atelie-bela": ["#3a0a2a", "#7a1a4a", "#ff6aaa"],
  "casa-norte": ["#1a0a0a", "#3a2a1a", "#aa7a4a"],
  "fervor-perfumaria": ["#2a0a1a", "#4a0a2a", "#ff4a8a"],
  "dominio-relogios": ["#0a0a0a", "#1a1a1a", "#aaaaaa"],
  "luminaria-casa": ["#1a0a2a", "#2a1a3a", "#ffaa44"],
  "joalheria-tropical": ["#0a2a1a", "#0a4a2a", "#ffd700"],
  "eletro-prime": ["#0a0a0a", "#2a1a1a", "#ff4a4a"],
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const b = findBrandBySlug(slug);
  const [c1, c2, c3] = BRAND_COLORS[slug] ?? ["#0a0612", "#7C3AED", "#FF2E92"];

  const W = 1600,
    H = 600;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="0.5" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c3}" stop-opacity="0.6"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.7">
      <stop offset="0" stop-color="${c3}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <circle cx="${W * 0.85}" cy="${H * 0.25}" r="180" fill="${c3}" opacity="0.18"/>
  <circle cx="${W * 0.15}" cy="${H * 0.8}" r="240" fill="${c2}" opacity="0.2"/>
  <text x="${W / 2}" y="${H / 2 + 30}" font-family="-apple-system, 'SF Pro Display', system-ui, sans-serif" font-weight="900" font-size="120" fill="white" opacity="0.18" text-anchor="middle" letter-spacing="4">${(b?.name ?? slug).toUpperCase()}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
