// Admin gate via allowlist de e-mails (env ADMIN_EMAILS, CSV).
// Fallback pra agência F3X em dev se a var não estiver setada.

import { auth } from "@/auth";

const DEFAULT_ADMINS = ["agenciaf3xia@gmail.com", "livoolivecommerce@gmail.com", "vertiplayoficial@gmail.com"];

export function adminEmails(): string[] {
  const csv = process.env.ADMIN_EMAILS ?? "";
  const list = csv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return DEFAULT_ADMINS;
  return list;
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email;
  if (!isAdminEmail(email)) {
    throw new Error("unauthorized");
  }
  return { session, email: email! };
}

export async function isAdminSession(): Promise<boolean> {
  const session = await auth();
  return isAdminEmail(session?.user?.email);
}
