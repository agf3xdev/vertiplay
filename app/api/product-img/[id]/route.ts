// Imagem SVG dinâmica por produto — fallback consistent.
// Mostra nome, preço, marca.

import { NextRequest } from "next/server";
import { findProductBySlug, BRANDS } from "@/lib/shop";
import { PRODUCTS } from "@/lib/shop";

const CAT_COLORS: Record<string, [string, string]> = {
  Vestido: ["#2a0a1a", "#ff4a8a"],
  Blazer: ["#1a1a2a", "#7a8aff"],
  Relógio: ["#1a1a1a", "#aaaaaa"],
  Anel: ["#1a0a0a", "#ff2a4a"],
  Colar: ["#0a2a1a", "#ffd700"],
  Perfume: ["#1a0a2a", "#ff4a8a"],
  Sofá: ["#2a1a0a", "#aa7a4a"],
  Mesa: ["#1a0a0a", "#7a4a2a"],
  Iluminação: ["#2a1a3a", "#ffaa44"],
  Cafeteira: ["#1a0a0a", "#aa4a2a"],
  Geladeira: ["#0a0a1a", "#aacccc"],
  Brinquedo: ["#2a0a4a", "#ffaa44"],
  Linho: ["#2a2a1a", "#d4c4a0"],
  "Cesta Premium": ["#0a3a1a", "#ffd700"],
  Eletrônico: ["#0a0a2a", "#3aaaff"],
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const p = PRODUCTS.find((x) => x.id === id || x.slug === id);
  const name = p?.name ?? "Produto";
  const cat = p?.category ?? "Item";
  const brand = p ? BRANDS.find((b) => b.id === p.brandId)?.name : undefined;
  const [c1, c2] = CAT_COLORS[cat] ?? ["#0a0612", "#7C3AED"];

  const W = 600,
    H = 600;
  // Quebra nome em até 3 linhas
  const words = name.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 16) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  const titleLines = lines.slice(0, 3);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="shine" cx="0.5" cy="0.4" r="0.5">
      <stop offset="0" stop-color="white" stop-opacity="0.18"/>
      <stop offset="1" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#shine)"/>
  <text x="32" y="56" font-family="-apple-system, system-ui, sans-serif" font-weight="700" font-size="14" fill="white" opacity="0.65" letter-spacing="3">${(cat || "").toUpperCase()}</text>
  <g font-family="-apple-system, 'SF Pro Display', system-ui, sans-serif" font-weight="800" fill="white">
    ${titleLines
      .map(
        (ln, i) =>
          `<text x="32" y="${H / 2 + i * 48 - ((titleLines.length - 1) * 24)}" font-size="36" letter-spacing="-1">${ln.replace(/[<>&"']/g, "")}</text>`
      )
      .join("\n    ")}
  </g>
  ${brand ? `<text x="32" y="${H - 32}" font-family="-apple-system, system-ui, sans-serif" font-weight="600" font-size="14" fill="white" opacity="0.7">${brand}</text>` : ""}
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
