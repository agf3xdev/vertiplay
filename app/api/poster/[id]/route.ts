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

  const title = s?.title ?? "Vertiplay";
  const genre = s?.genre ?? "Drama";
  const exclusive = s?.isExclusive ?? false;
  const [c1, c2, c3] = colorsFor(genre);
  const lines = wrap(title);

  // Layout 540x960 (9:16 — bom pra retina mobile)
  const W = 540;
  const H = 960;
  const titleStartY = H - 100 - lines.length * 56;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="0.5" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c3}" stop-opacity="0.6"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.55" r="0.6">
      <stop offset="0" stop-color="${c3}" stop-opacity="0.55"/>
      <stop offset="0.5" stop-color="${c2}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="vp" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF2E92"/>
      <stop offset="0.6" stop-color="#7C3AED"/>
      <stop offset="1" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0.4" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.7" stop-color="#000" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.95"/>
    </linearGradient>
    <filter id="texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="${(s?.id ?? "x").charCodeAt(0) % 99}"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" filter="url(#texture)"/>

  <!-- Decorative shapes -->
  <circle cx="${W - 60}" cy="${120}" r="${80}" fill="${c3}" opacity="0.15"/>
  <circle cx="${60}" cy="${H - 280}" r="${140}" fill="${c2}" opacity="0.18"/>
  <path d="M 0 ${H * 0.35} Q ${W / 2} ${H * 0.5} ${W} ${H * 0.4} L ${W} ${H * 0.65} Q ${W / 2} ${H * 0.55} 0 ${H * 0.6} Z" fill="${c3}" opacity="0.06"/>

  <!-- Vertiplay logo (canto sup esq) -->
  <g transform="translate(28, 28)">
    <rect width="44" height="44" rx="12" fill="url(#vp)"/>
    <path d="M 16 12 L 32 22 L 16 32 Z" fill="white"/>
  </g>

  ${
    exclusive
      ? `<g transform="translate(${W - 180}, 36)">
      <rect width="150" height="28" rx="14" fill="url(#vp)"/>
      <text x="75" y="19" font-family="-apple-system, system-ui, sans-serif" font-weight="800" font-size="11" letter-spacing="1.5" fill="white" text-anchor="middle">EXCLUSIVO</text>
    </g>`
      : ""
  }

  <!-- Genre badge -->
  <g transform="translate(28, ${titleStartY - 50})">
    <rect width="${genre.length * 12 + 24}" height="32" rx="16" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="${(genre.length * 12 + 24) / 2}" y="21" font-family="-apple-system, system-ui, sans-serif" font-weight="600" font-size="13" fill="white" text-anchor="middle">${escape(genre)}</text>
  </g>

  <!-- Fade bottom -->
  <rect y="${H * 0.4}" width="${W}" height="${H * 0.6}" fill="url(#fade)"/>

  <!-- Title -->
  <g font-family="-apple-system, 'SF Pro Display', system-ui, sans-serif" font-weight="900" fill="white">
    ${lines
      .map(
        (ln, i) =>
          `<text x="28" y="${titleStartY + i * 56}" font-size="44" letter-spacing="-1">${escape(ln)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Vertiplay watermark -->
  <text x="28" y="${H - 32}" font-family="-apple-system, system-ui, sans-serif" font-weight="700" font-size="14" fill="white" opacity="0.55" letter-spacing="2">VERTIPLAY</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
