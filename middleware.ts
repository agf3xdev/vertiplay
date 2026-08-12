import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// roteiristas.vertiplay.com.br é um subdomínio dedicado que aponta pro mesmo
// app — a raiz dele deve mostrar a landing de seleção de histórias.
const LANDING_HOST = "roteiristas.vertiplay.com.br";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (host === LANDING_HOST && req.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/roteiristas", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
