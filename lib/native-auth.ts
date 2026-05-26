"use client";
import { signIn } from "next-auth/react";

// Wrappers pro plugin nativo @capgo/capacitor-social-login.
// No browser comum (web/PWA), isCapacitor() retorna false e o fluxo OAuth web é usado.
// Dentro do app nativo (iOS/Android), abrimos o Google Sign-In nativo
// (não-WebView, contornando o erro 403 disallowed_useragent do Google).

export function isCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w?.Capacitor?.isNativePlatform?.());
}

let initialized = false;

async function ensureInit() {
  if (initialized) return;
  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  // iOS lê GIDClientID/GIDServerClientID do Info.plist;
  // Android lê server_client_id de strings.xml.
  // Mantemos initialize sem args — plugin pega da config nativa.
  await SocialLogin.initialize({ google: { webClientId: "" } } as any);
  initialized = true;
}

export async function signInWithGoogleNative(): Promise<{ ok: boolean; error?: string }> {
  if (!isCapacitor()) {
    await signIn("google");
    return { ok: true };
  }
  await ensureInit();
  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  const res: any = await SocialLogin.login({
    provider: "google",
    options: { scopes: ["email", "profile"] },
  });
  const idToken: string | undefined = res?.result?.idToken;
  if (!idToken) return { ok: false, error: "Sem idToken do Google" };

  const r = await signIn("google-native", { idToken, redirect: false });
  if (r?.error) return { ok: false, error: r.error };
  return { ok: true };
}
