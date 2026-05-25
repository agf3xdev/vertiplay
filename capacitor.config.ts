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
  },
  android: {
    backgroundColor: "#0a0612",
    appendUserAgent: "VertiplayApp/1.0",
  },
  ios: {
    backgroundColor: "#0a0612",
    contentInset: "always",
    scrollEnabled: true,
    appendUserAgent: "VertiplayApp/1.0",
  },
};

export default config;
