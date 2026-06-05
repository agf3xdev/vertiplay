# Native (iOS + Android)

Capacitor 8 wrap. Estratégia: **WebView que carrega a URL produção** (`https://mvp.vertiplay.com.br`). Updates de produto = git push → deploy DO. Não precisa rebuild do APK/IPA.

## Capacitor config

`capacitor.config.ts`:

```ts
{
  appId: "com.diogoarchanjo.vertiplay",
  appName: "Vertiplay",
  webDir: "public",
  server: {
    url: "https://mvp.vertiplay.com.br",
    cleartext: false,
    androidScheme: "https",
    allowNavigation: [
      "accounts.google.com",
      "*.google.com",
      "*.googleusercontent.com",
      "appleid.apple.com",
    ],
  },
  android: { backgroundColor: "#0a0612" },
  ios: { backgroundColor: "#0a0612", contentInset: "always", scrollEnabled: true },
}
```

**`allowNavigation`:** mantém OAuth do Google dentro do WebView (não abre browser externo, que perderia cookies de state).

## Quando rebuildar o app nativo

- Mudou versão (`versionCode`/`build`)
- Adicionou/removeu plugin Capacitor
- Mudou config nativa (URL scheme, ícone, capability)
- Mudou `capacitor.config.ts`

**Caso contrário, NÃO precisa.** Push pro DO → app pega via WebView no próximo reload.

## iOS

### Estrutura
```
ios/App/
├── App.xcodeproj/        Xcode project
├── App.xcworkspace/      Workspace (abrir esse)
├── App/
│   ├── AppDelegate.swift Bootstrap Capacitor
│   ├── Info.plist
│   ├── capacitor.config.json (gerado por cap sync)
│   ├── config.xml
│   ├── Assets.xcassets   Ícones (logo-v)
│   └── public/           Web assets (gerado por cap sync)
└── App/CapApp-SPM/       Swift Package Manager (Capacitor + plugins)
```

### Versões
- **Marketing Version:** `1.0.4` (visível no App Store)
- **Build:** `4` (CURRENT_PROJECT_VERSION)

Bump via `ios/App/App.xcodeproj/project.pbxproj` (sed) ou GUI no Xcode → General → Identity.

### Bundle ID
`com.diogoarchanjo.vertiplay`

### Signing
- Team: **AGENCIA F3X CONSULTORIA DESENVOLVI...** (Apple Developer F3X)
- Automatically manage signing: ON
- Signing Certificate: Apple Development (Diogo Archanjo Ferreira)

### URL Schemes (Info.plist)
Pra Google Sign-In nativo (reverso do `GOOGLE_IOS_CLIENT_ID`):
```
com.googleusercontent.apps.<NUMERIC_ID>
```

### Build/Archive

```bash
# Sync (sempre antes)
npx cap sync ios

# Abrir Xcode
npx cap open ios
# ou: open ios/App/App.xcworkspace
```

No Xcode:
1. Selecionar target `App` + destination `Any iOS Device (arm64)`
2. Product → Archive
3. Organizer abre → Distribute App → App Store Connect → Upload

Subir pra **TestFlight** automaticamente. Processamento ~10-30min.

### Plugin Social Login
`@capgo/capacitor-social-login` configurado em runtime via `lib/native-auth.ts`:

```ts
await SocialLogin.initialize({
  google: {
    iOSClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    // ...
  }
});
```

## Android

### Estrutura
```
android/
├── app/
│   ├── build.gradle              versionCode + versionName
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/diogoarchanjo/vertiplay/MainActivity.java
│   │   ├── res/                  Ícones, splash, strings
│   │   └── assets/public/        Web assets (gerado)
│   └── google-services.json      Firebase (se usar push)
├── capacitor.settings.gradle     (gerado por cap sync)
├── capacitor-cordova-android-plugins/
├── gradle/
├── keystore/
│   └── vertiplay-release.keystore   ⚠️ CRÍTICO — backup!
├── settings.gradle
└── variables.gradle              Versões de deps
```

### Versões
- **versionCode:** `5` (incrementa a cada submission)
- **versionName:** `1.0.4`

Bump em `android/app/build.gradle`:
```groovy
versionCode 5
versionName "1.0.4"
```

### Application ID
`com.diogoarchanjo.vertiplay`

### Signing (`build.gradle`)
```groovy
signingConfigs {
    release {
        storeFile file('../keystore/vertiplay-release.keystore')
        storePassword 'VertiplayF3X2026'
        keyAlias 'vertiplay'
        keyPassword 'VertiplayF3X2026'
    }
}
```

⚠️ **Keystore CRÍTICO.** Sem ele, não dá pra atualizar o app no Play Store. Backup em:
- `~/.../Obsidian Vault/Vertiplay/keystore-backup/`
- Local seguro offline

### Targets SDK (`variables.gradle`)
- `minSdkVersion 24` (Android 7.0)
- `compileSdkVersion 36`
- `targetSdkVersion 36`

### Build AAB

```bash
# Sync
npx cap sync android

# Build (requer JAVA_HOME + ANDROID_HOME)
cd android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Upload Play Console

1. play.google.com/console → Vertiplay
2. **Testes → Testes internos** (ou **Produção**)
3. Criar nova versão → Upload do `.aab`
4. Preencher notas do lançamento
5. Revisar → Iniciar lançamento

Aviso comum (não-bloqueante): "Sem arquivo de desofuscação". Acontece porque `minifyEnabled false`. Ignorar.

## Pipeline UI

`<RootShell>` decide entre `mobile-frame` (480px) ou full. Em mobile nativo, a tela é menor que 480px e ocupa tudo naturalmente. Em tablet/desktop web, mantém o "celular" centralizado pra preview.

## Splash & Ícone

- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/` (1024x1024 + size variants)
- Android: `android/app/src/main/res/mipmap-*/` (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi)
- Logo source: `public/logo-v.svg`

Pra atualizar ícones, usar `@capacitor/assets` ou Image Asset Studio (Android Studio).

## Permissões

Nenhuma especial declarada além de:
- Internet (obvio, WebView)
- iOS: nenhuma de tracking (sem IDFA), nenhuma de câmera/galeria ainda

## Debug

### iOS
```bash
npx cap run ios
# Ou: abre Xcode → Run em simulator/device
```

Safari → Develop → [device] → vertiplay.com.br = DevTools no WebView.

### Android
```bash
npx cap run android
# Ou: Android Studio → Run
```

Chrome → chrome://inspect → vertiplay.com.br WebView = DevTools.

ADB instalado em `~/tools/platform-tools/adb` (sem brew no Mac).

## Limitações conhecidas

- **OAuth web em WebView Capacitor**: alguns providers bloqueiam WebView (User-Agent check). Solução: Google Sign-In nativo via plugin.
- **Apple Sign In**: implementado e removido — não estava funcionando. Apenas Google + Email OTP no app nativo.
- **Push notifications**: ainda não implementado. Próximo: integrar FCM (Android) + APNs (iOS).
- **In-app purchases**: não implementado. Stripe/MP via WebView funciona, mas Apple pode exigir IAP pra "digital content" (coins/VIP).
