# Guida per trasformare il sito in App Mobile

## Opzione 1: PWA (Progressive Web App)
Trasforma il sito in un'app installabile dal browser.

### Implementazione:
```bash
# Installa le dipendenze PWA
npm install next-pwa

# Configura next.config.js
# Aggiungi service worker
# Crea manifest.json
```

### Vantaggi:
- ✅ Installabile su mobile
- ✅ Funziona offline
- ✅ Notifiche push
- ✅ Un solo codice

### Limitazioni:
- ❌ Non negli store ufficiali
- ❌ Funzionalità native limitate

---

## Opzione 2: Capacitor (CONSIGLIATA)
Trasforma il sito Next.js in app nativa per iOS e Android.

### Implementazione:
```bash
# 1. Installa Capacitor
npm install @capacitor/core @capacitor/cli

# 2. Inizializza progetto
npx cap init "Maskio Barber" "com.maskio.barber"

# 3. Build del sito
npm run build

# 4. Aggiungi piattaforme
npx cap add ios
npx cap add android

# 5. Copia assets
npx cap copy

# 6. Apri in IDE nativo
npx cap open ios     # Xcode
npx cap open android # Android Studio
```

### Capacitor Configuration:
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maskio.barber',
  appName: 'Maskio Barber',
  webDir: 'out', // Next.js static export
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF"
    }
  }
};

export default config;
```

### Plugin utili per barbiere:
```bash
# Notifiche per appuntamenti
npm install @capacitor/push-notifications @capacitor/local-notifications

# Telefonate dirette
npm install @capacitor/device @capacitor/app

# Condivisione
npm install @capacitor/share

# Calendario
npm install @capacitor/calendar
```

### Funzionalità native per barbiere:
1. **Notifiche appuntamenti**: Promemoria automatici
2. **Chiamata diretta**: Tap per chiamare il barbiere
3. **Condivisione**: Condividi appuntamento
4. **Calendario**: Sincronizza con calendario nativo
5. **Geolocalizzazione**: Navigazione al negozio

---

## Opzione 3: React Native
Riscrivere completamente l'app.

### Pro:
- ✅ Performance native
- ✅ UI completamente nativa

### Contro:
- ❌ Riscrivi tutto il codice
- ❌ Due progetti separati

---

## Processo di pubblicazione:

### App Store (iOS):
1. Account Apple Developer ($99/anno)
2. Build con Xcode
3. App Store Connect
4. Review process (~1-7 giorni)

### Play Store (Android):
1. Google Play Console ($25 una tantum)
2. Build APK/AAB
3. Upload e configurazione
4. Review process (~2-3 giorni)

---

## Raccomandazione finale:

**CAPACITOR** è la soluzione migliore perché:
- ✅ Zero refactoring del codice esistente
- ✅ App store ufficiali
- ✅ Funzionalità native
- ✅ Un solo codice da mantenere
- ✅ Upgrade facile del sito web

Il tuo sito Next.js diventa app mobile in ~2 ore di lavoro!
