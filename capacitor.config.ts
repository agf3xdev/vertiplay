import type { CapacitorConfig } from "@capacitor/cli";

// Estratégia: PWA via WebView (Capacitor). O app nativo carrega a URL
// produção https://vertiplay.diogoarchanjo.com.br — todas as updates de
// produto não precisam rebuild do APK/IPA, é só deploy no DO.

const config: CapacitorConfig = {
  appId: "com.diogoarchanjo.vertiplay",
  appName: "Vertiplay",
  webDir: "public",
  server: {
    url: "https://vertiplay.diogoarchanjo.com.br",
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
};

export default config;
