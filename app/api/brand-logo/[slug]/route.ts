// Logo SVG dinâmico por marca — sempre carrega, on-brand.
// Letras iniciais + paleta da marca.

import { NextRequest } from "next/server";
import { findBrandBySlug } from "@/lib/shop";

// Paleta por slug — combina com identidade da marca real quando há
const BRAND_COLORS: Record<string, [string, string]> = {
  "primus-rio": ["#0a2a5c", "#3a8aff"],
  mui: ["#d4c4a0", "#1a3a6a"],
  "o-amigao": ["#0c7a3a", "#ffd700"],
  "tubarao-atacadao": ["#0a1a3a", "#ffaa00"],
  "atelie-bela": ["#7a1a4a", "#ff6aaa"],
  "casa-norte": ["#3a2a1a", "#aa7a4a"],
  "fervor-perfumaria": ["#4a0a2a", "#ff4a8a"],
  "dominio-relogios": ["#1a1a1a", "#aaaaaa"],
  "luminaria-casa": ["#2a1a3a", "#ffaa44"],
  "joalheria-tropical": ["#0a4a2a", "#ffd700"],
  "eletro-prime": ["#1a1a1a", "#ff4a4a"],
};

function colorsFor(slug: string): [string, string] {
  return BRAND_COLORS[slug] ?? ["#7C3AED", "#FF2E92"];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 1 || w === w.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const b = findBrandBySlug(slug);
  const name = b?.name ?? slug;
  const [c1, c2] = colorsFor(slug);
  const init = initials(name);

  const W = 240,
    H = 240;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="shine" cx="0.3" cy="0.3" r="0.5">
      <stop offset="0" stop-color="white" stop-opacity="0.4"/>
      <stop offset="1" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="48" fill="url(#g)"/>
  <rect width="${W}" height="${H}" rx="48" fill="url(#shine)"/>
  <text x="${W / 2}" y="${H / 2 + 30}" font-family="-apple-system, 'SF Pro Display', system-ui, sans-serif" font-weight="900" font-size="${init.length > 1 ? 96 : 130}" fill="white" text-anchor="middle" letter-spacing="-2">${init}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

// Cover (1600x600) — banner da página da marca
export async function POST() {
  return Response.json({ error: "use GET" }, { status: 405 });
}
