// Gera poster SVG dinâmico por série — sempre funciona, branded, não depende de Unsplash.
// 9:16 portrait com gradiente por gênero, título wrapped, badges.

import { NextRequest } from "next/server";
import { findSeries } from "@/lib/catalog";

const GENRE_COLORS: Record<string, [string, string, string]> = {
  Bilionário: ["#1a0f0a", "#7a4a1a", "#ffb84a"],
  Lobisomem: ["#1a0a0a", "#7a1a1a", "#ff4a4a"],
  Máfia: ["#0a0a0a", "#2a0a0a", "#ff2a2a"],
  CEO: ["#0a0e1f", "#2a2a6a", "#7a8aff"],
  "Amor Proibido": ["#1a0a14", "#7a1a4a", "#ff4a8a"],
  "Identidade Oculta": ["#0a0f1a", "#2a3a6a", "#6aaaff"],
  Vingança: ["#0a0a0a", "#3a0a1a", "#ff2a4a"],
  CASAMENTO: ["#1a0f1a", "#5a2a5a", "#ff8aaa"],
};

function colorsFor(genre: string): [string, string, string] {
  return GENRE_COLORS[genre] ?? ["#0a0612", "#7c3aed", "#ff2e92"];
}

// Quebra título em linhas de ~14 chars
function wrap(title: string, maxLineLen = 16): string[] {
  const words = title.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxLineLen) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = findSeries(id);

  const genre = s?.genre ?? "Drama";
  const [c1, c2, c3] = colorsFor(genre);

  // Layout 540x960 (9:16). SEM TÍTULO — o HTML já renderiza o título por cima.
  // O poster aqui é só atmosfera visual (gradiente + textura + silhueta + watermark).
  const W = 540;
  const H = 960;
  const seed = (s?.id ?? "x").charCodeAt(0) % 99;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="0.5" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c3}" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.55" cy="0.4" r="0.65">
      <stop offset="0" stop-color="${c3}" stop-opacity="0.55"/>
      <stop offset="0.5" stop-color="${c2}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0.3" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.65"/>
    </linearGradient>
    <filter id="texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${seed}"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" filter="url(#texture)"/>

  <!-- Formas decorativas (atmosfera, não texto) -->
  <circle cx="${W - 80}" cy="${180}" r="${130}" fill="${c3}" opacity="0.15"/>
  <circle cx="${80}" cy="${H - 220}" r="${180}" fill="${c2}" opacity="0.16"/>
  <path d="M -50 ${H * 0.6} Q ${W / 2} ${H * 0.45} ${W + 50} ${H * 0.65} L ${W + 50} ${H * 0.85} Q ${W / 2} ${H * 0.7} -50 ${H * 0.9} Z" fill="${c3}" opacity="0.08"/>

  <!-- Fade pra escurecer base (legibilidade do texto HTML por cima) -->
  <rect y="${H * 0.5}" width="${W}" height="${H * 0.5}" fill="url(#fade)"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
