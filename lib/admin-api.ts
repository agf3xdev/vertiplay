// Helpers compartilhados pelas rotas /api/admin/*
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/auth";

export async function gate() {
  const session = await auth();
  const email = session?.user?.email;
  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  return null;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseInt0(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export function parseFloat0(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function str(v: unknown, def = ""): string {
  return typeof v === "string" ? v : def;
}

export function strOpt(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : null;
}

export function bool(v: unknown): boolean {
  return v === true || v === "true" || v === "on" || v === 1;
}
