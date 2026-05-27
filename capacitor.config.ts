import type { CapacitorConfig } from "@capacitor/cli";

// Estratégia: PWA via WebView (Capacitor). O app nativo carrega a URL
// produção https://mvp.vertiplay.com.br — todas as updates de
// produto não precisam rebuild do APK/IPA, é só deploy no DO.

const config: CapacitorConfig = {
  appId: "com.diogoarchanjo.vertiplay",
  appName: "Vertiplay",
  webDir: "public",
  server: {
    url: "https://mvp.vertiplay.com.br",
    cleartext: false,
    androidScheme: "https",
    // Mantém OAuth do Google dentro do WebView (não abre browser externo,
    // que perderia os cookies de state e quebraria o login).
    allowNavigation: [
      "accounts.google.com",
      "*.google.com",
      "*.googleusercontent.com",
      "appleid.apple.com",
    ],
  },
  android: {
    backgroundColor: "#0a0612",
  },
  ios: {
    backgroundColor: "#0a0612",
    contentInset: "always",
    scrollEnabled: true,
  },
  // Config do SocialLogin é feita em runtime em lib/native-auth.ts
  // (capacitor.config.ts é processado em build-time e não resolve process.env).
};

export default config;
