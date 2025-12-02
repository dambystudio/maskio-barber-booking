# 🔧 Guida Risoluzione Problemi PWA

## Problema 1: Slot non aggiornati su telefono

### Sintomo
Desktop mostra slot disponibili, telefono mostra "tutto occupato"

### Causa
Cache Service Worker con dati vecchi

### Soluzione A: Via interfaccia PWA (più semplice)
1. Apri la PWA sul telefono
2. Vai su `/debug-push`
3. Clicca **"🔄 Aggiorna SW"**
4. Attendi ricaricamento automatico
5. Torna al calendario e verifica

### Soluzione B: Elimina e reinstalla PWA
1. Tieni premuto sull'icona PWA
2. Seleziona "Rimuovi app"
3. Apri Safari → vai su maskiobarberconcept.it
4. Clicca icona condivisione → "Aggiungi a Home"
5. Apri la nuova PWA

### Soluzione C: Pulizia manuale Safari (più completa)
1. Vai su **Impostazioni** → **Safari**
2. Scorri fino a **Avanzate**
3. Clicca **Dati dei siti web**
4. Cerca "dominical" o "maskio"
5. Scorri verso sinistra → **Elimina**
6. Riapri la PWA

---

## Problema 2: Notifiche smettono di funzionare

### Sintomo
Dopo chiusura/riapertura PWA, non ricevi più notifiche

### Causa
Service Worker perde subscription quando PWA chiusa

### Soluzione A: Riattiva notifiche (automatica)
Ora c'è un sistema automatico che:
- ✅ Controlla subscription ogni 5 minuti
- ✅ Ti avvisa se notifiche disattivate
- ✅ Riattiva subscription quando riapri PWA

**Non devi fare nulla!** Il sistema si auto-ripara.

### Soluzione B: Riattiva manualmente
1. Apri `/debug-push`
2. Clicca **"🔁 Resubscribe"**
3. Verifica che appaia "✅ Subscription Attiva"
4. Clicca **"🧪 Test Notifica Server"**
5. Dovresti ricevere notifica entro 5 secondi

### Verifica stato
Su `/debug-push` puoi vedere:
- 🔧 **Service Worker State**: deve essere "Active: activated"
- ✅ **Subscription Attiva**: deve mostrare endpoint
- 📋 **Log Console**: eventuali errori

---

## Test Completo

### 1. Pulisci cache telefono
- Usa **Soluzione C** sopra (più completa)

### 2. Verifica notifiche
- Vai su `/debug-push`
- Clicca **"🔍 Controlla Ambiente"**
- Verifica che tutto sia ✅ verde
- Clicca **"🔁 Resubscribe"**
- Clicca **"🧪 Test Notifica Server"**

### 3. Testa calendario
- Vai su **Prenota**
- Seleziona **Michele**
- Seleziona **5 dicembre 2025**
- Verifica che vedi **slot 10:00 disponibile**

### 4. Testa waitlist
- Se 5 dicembre mostra "Lista d'attesa" (tutto occupato)
- Clicca → compila form → invia
- Dovresti vedere conferma iscrizione

---

## Monitoring Automatico

Il nuovo sistema **PushNotificationManager**:

### Check Periodici
- ⏰ Ogni 5 minuti verifica subscription
- 🔄 Se persa, mostra notifica all'utente
- 📱 Auto-resubscribe quando possibile

### Eventi Gestiti
- ✅ PWA installata → inizializza notifiche
- ✅ App tornata visibile → verifica subscription
- ✅ Window focus → controlla stato
- ✅ Visibilità cambiata → reinizializza se necessario

### Log Debugging
Apri console browser e cerca:
- `[PushManager]` → operazioni manager
- `[SW-PUSH]` → eventi Service Worker
- `[Push]` → notifiche ricevute

---

## Script Emergenza

Se niente funziona, copia questo nella console Safari mobile:

```javascript
(async function() {
  console.log('🧹 Pulizia emergenza...');
  
  // Elimina cache
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    await caches.delete(name);
    console.log('✅ Cache eliminata:', name);
  }
  
  // Disregistra SW
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const reg of registrations) {
    await reg.unregister();
    console.log('✅ SW disregistrato');
  }
  
  console.log('✅ Completato! Ricarico...');
  setTimeout(() => location.reload(), 2000);
})();
```

---

## Contatti

Se i problemi persistono:
1. Vai su `/debug-push`
2. Fai screenshot della sezione **"📋 Log Console"**
3. Invia screenshot per analisi
