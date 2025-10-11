# 🎯 Guida Rapida: Accesso Pulizia Cache

## ✅ Modifiche Completate

### 1. Homepage - Pulsante nella Hero Section
**Posizione**: Sotto il pulsante "Contattaci" nella sezione principale
- 🎨 **Design**: Bordo sottile, stile discreto con effetto hover viola
- 📱 **Testo**: "🧹 Risolvi Problemi Cache"
- 🔗 **Link**: `/force-cache-clear`

### 2. Floating Helper Button (Globale)
**Nuovo componente**: `CacheHelperButton.tsx`
- 📍 **Posizione**: Bottom-right (fisso su tutte le pagine)
- 🎨 **Icona**: 🛠️ (tool emoji)
- 📱 **Mobile**: Bottom 24 (sopra bottom nav)
- 💻 **Desktop**: Bottom 8, Right 8

**Menu a tendina include**:
- 🧹 Pulisci Cache → `/force-cache-clear`
- 🔔 Test Notifiche → `/debug-push`

### 3. Pagina `/force-cache-clear` Migliorata
**Miglioramenti UI**:
- ✅ Emoji gigante centrale (🧹)
- ✅ Descrizioni sotto ogni pulsante
- ✅ Ordine ottimizzato: Test API → Pulisci → Reset → Prenota
- ✅ Responsive design (padding adattivo)
- ✅ Shadow più pronunciate per pulsanti

## 📱 Come Usare

### Da Homepage
1. Scroll fino alla sezione CTA finale
2. Clicca **"🧹 Risolvi Problemi Cache"**
3. Segui istruzioni nella pagina

### Da Qualsiasi Pagina
1. Clicca il pulsante **🛠️** in basso a destra
2. Nel menu popup, scegli:
   - **Pulisci Cache** → per problemi calendario
   - **Test Notifiche** → per problemi push

### Sul Telefono (iOS)
1. Apri PWA
2. Vai su `/force-cache-clear` (usa helper button)
3. Clicca **"🧪 Test API"** → guarda log
4. Se API funziona ma calendario no → **"💣 Reset Completo"**
5. Aspetta redirect automatico

## 🔧 Workflow Debugging

### Step 1: Verifica Server
```
Clicca "🧪 Test API"
```
**Cosa cercare nei log**:
- ✅ `Slot disponibili: 10:00` → Server funziona
- ❌ `Nessuno slot disponibile` → Problema database/API

### Step 2: Se Server OK ma Calendario NO
```
Clicca "💣 Reset Completo"
```
**Cosa fa**:
1. Elimina tutte le cache
2. Disregistra Service Workers
3. Redirect a `/prenota`
4. Calendario si ricarica fresh

### Step 3: Verifica Risolto
```
Clicca "➡️ Vai a Prenota"
```
- Seleziona Michele
- 5 dicembre 2025
- Dovresti vedere slot 10:00 disponibile

## 🎨 Design Tokens

### Helper Button
- **Colore primario**: Purple gradient (600-800)
- **Hover**: Scale 1.1
- **Tap**: Scale 0.95
- **Shadow**: 2xl
- **Z-index**: 40 (above content, below modals)

### Menu Popup
- **Background**: Gray-900
- **Blur**: None (solid per leggibilità)
- **Border radius**: 2xl (rounded-2xl)
- **Width**: 256px (w-64)
- **Animation**: Framer Motion (spring)

### Force Cache Clear Page
- **Background**: Purple gradient (600-900)
- **Card**: White/10 backdrop blur
- **Buttons**: Shadow-lg per depth
- **Log area**: Black/30 (readable contrast)

## 📊 Posizionamento Z-Index

```
z-50: Modals
z-40: Helper Button ← Nuovo
z-30: Bottom Nav Mobile
z-20: Floating Menu
z-10: Navbar
z-0: Content
```

## 🚀 Deploy Checklist

Prima di andare live:
- [x] Componente CacheHelperButton creato
- [x] Aggiunto a layout.tsx
- [x] Pulsante homepage aggiunto
- [x] Pagina force-cache-clear migliorata
- [x] Test compilazione (no errors)
- [ ] Test su mobile (verifica z-index)
- [ ] Test helper button functionality
- [ ] Verifica non overlap con bottom nav

## 💡 Tips per Utenti

**Quando usare "Pulisci Cache"**:
- Calendario mostra slot occupati ma sai che sono liberi
- Date non si aggiornano
- Modifiche recenti non appaiono

**Quando usare "Reset Completo"**:
- Notifiche smettono di funzionare
- App sembra "congelata"
- Dopo update importante dell'app

**Non necessario se**:
- Tutto funziona normalmente
- Solo curiosità (non cliccare a caso!)

## 🐛 Known Issues

**Helper Button su iPhone**:
- Position fixed può avere glitch in Safari durante scroll
- Soluzione: Testare con `-webkit-transform: translateZ(0)`

**Cache Clear su iOS**:
- Safari può mantenere cache anche dopo clear programmatico
- Soluzione: Guida utente a Settings → Safari → Clear Data

## 📝 Future Improvements

- [ ] Analytics: Track quanti user usano cache clear
- [ ] Auto-detect: Mostra helper button solo se problemi rilevati
- [ ] Toast notification: Conferma dopo cache clear
- [ ] Badge count: Mostra se problemi rilevati
- [ ] Language: i18n per messaggi
