# 🔔 Sistema di Notifiche Lista d'Attesa - Implementazione Completa

## 📋 Panoramica del Sistema

Il sistema di notifiche per la lista d'attesa è stato completamente integrato nel sito Maskio Barber. Permette agli utenti di ricevere notifiche push quando si libera un posto per un giorno richiesto.

## 🎯 Flusso Completo

### 1. **Utente si mette in lista d'attesa**
- L'utente cerca di prenotare ma il giorno è pieno
- Clicca su "📋 Lista d'attesa"
- Viene aggiunto alla lista per quel giorno/barbiere
- Riceve un numero di posizione

### 2. **Si libera un posto (cancellazione prenotazione)**
- Un cliente cancella una prenotazione
- Il sistema cerca automaticamente utenti in lista d'attesa per quel giorno/barbiere
- Trova il primo in lista (posizione #1)
- Invia notifica push all'utente

### 3. **Utente riceve notifica**
```
🎉 Posto Disponibile!
Si è liberato un posto per il [giorno] alle [ora].
Conferma entro 24 ore!
```
- Notifica push anche con app/browser chiuso
- Click sulla notifica → reindirizza a /area-personale/profilo

### 4. **Utente conferma o rifiuta**
- Nella pagina profilo appare sezione "🎉 Posto Disponibile!"
- Timer countdown per 24 ore
- Due opzioni:
  - **✅ Conferma Prenotazione**: Crea prenotazione automaticamente
  - **❌ Rifiuta**: Passa al prossimo in lista

### 5. **Gestione risposta**
- **Se accetta**: 
  - Prenotazione creata con status "confirmed"
  - Waitlist entry aggiornata a "approved"
  - Posizioni in lista riordinate
- **Se rifiuta**:
  - Waitlist entry aggiornata a "declined"
  - Notifica inviata al prossimo in lista
  - Posizioni riordinate

## 🗄️ Struttura Database

### Tabella `waitlist` (aggiornata)
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  barber_id VARCHAR(100),
  barber_name VARCHAR(100),
  date VARCHAR(20),
  service VARCHAR(100),
  price DECIMAL(8,2),
  customer_name VARCHAR(100),
  customer_email VARCHAR(100),
  customer_phone VARCHAR(20),
  notes TEXT,
  status VARCHAR(20), -- 'waiting', 'offered', 'approved', 'declined', 'expired'
  position INTEGER,
  
  -- NUOVI CAMPI PER OFFERTE
  offered_time VARCHAR(10),        -- Orario offerto (es. "15:00")
  offered_booking_id UUID,         -- ID della prenotazione cancellata
  offer_expires_at TIMESTAMP,      -- Scadenza offerta (24 ore)
  offer_response VARCHAR(20),      -- 'accepted', 'declined', 'expired'
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tabella `push_subscriptions` (esistente)
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  endpoint TEXT,
  p256dh TEXT,
  auth TEXT,
  created_at TIMESTAMP
);
```

## 🔌 API Endpoints

### 1. `/api/notifications/send-waitlist-alert` (POST)
**Scopo**: Invia notifiche push agli utenti in lista d'attesa

**Body**:
```json
{
  "bookingId": "uuid",
  "barberId": "fabio",
  "date": "2025-10-15",
  "time": "15:00"
}
```

**Funzionamento**:
1. Trova il primo utente in lista per quel giorno/barbiere
2. Aggiorna status waitlist a "offered"
3. Salva orario offerto e scadenza (NOW + 24h)
4. Cerca sottoscrizioni push dell'utente
5. Invia notifica a tutte le sottoscrizioni
6. Rimuove sottoscrizioni scadute (410/404)

**Response**:
```json
{
  "success": true,
  "message": "Notifica inviata a Mario Rossi",
  "sentTo": 2,
  "totalSubscriptions": 2,
  "waitlistId": "uuid"
}
```

### 2. `/api/waitlist/respond` (POST)
**Scopo**: Gestisce la risposta dell'utente all'offerta

**Body**:
```json
{
  "waitlistId": "uuid",
  "response": "accepted" // oppure "declined"
}
```

**Funzionamento**:

**Se "accepted"**:
1. Verifica che offerta non sia scaduta
2. Crea prenotazione con orario offerto
3. Aggiorna waitlist status a "approved"
4. Riordina posizioni altri utenti

**Se "declined"**:
1. Aggiorna waitlist status a "declined"
2. Riordina posizioni
3. Trova prossimo in lista
4. Invia notifica al prossimo

**Response (accettato)**:
```json
{
  "success": true,
  "booking": { ... },
  "message": "Prenotazione confermata per il 2025-10-15 alle 15:00"
}
```

### 3. `/api/bookings` (PUT/PATCH)
**Modificato**: Aggiunta logica notifica waitlist

Quando una prenotazione viene cancellata (`status: 'cancelled'`):
```javascript
// Dopo cancellazione email esistente...
fetch('/api/notifications/send-waitlist-alert', {
  method: 'POST',
  body: JSON.stringify({
    bookingId: booking.id,
    barberId: booking.barberId,
    date: booking.date,
    time: booking.time
  })
});
```

## 🎨 Componenti UI

### `UserWaitlist.tsx` (aggiornato)
**Posizione**: `/src/components/UserWaitlist.tsx`

**Funzionalità**:
- Mostra liste d'attesa dell'utente
- Separa offerte attive da liste normali
- Countdown timer per offerte
- Pulsanti conferma/rifiuta
- Auto-refresh ogni 30 secondi

**Sezioni**:
1. **Offerte Attive** (status === 'offered')
   - Box verde evidenziato
   - Timer con animazione pulse
   - Orario disponibile
   - Pulsanti azione grandi

2. **Liste d'Attesa** (status === 'waiting')
   - Box normali
   - Numero posizione
   - Pulsante rimuovi

## 🔔 Service Worker

### `public/sw.js`
**Push Event Handler**:
```javascript
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: data.data,
      requireInteraction: true // Notifica persistente
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

## 🚀 Testing

### Test Manuale
1. **Setup**:
   - Apri il sito su mobile/desktop
   - Login come utente
   - Vai a /debug-push
   - Clicca "Abilita Notifiche"

2. **Mettiti in lista d'attesa**:
   - Vai a prenotazione
   - Scegli un giorno pieno
   - Clicca "Lista d'attesa"

3. **Simula cancellazione**:
   - Login come barbiere/admin
   - Cancella una prenotazione per quel giorno
   - Sistema invia automaticamente notifica

4. **Verifica notifica**:
   - Controlla che arrivi notifica push
   - Click su notifica → vai a profilo
   - Vedi sezione "🎉 Posto Disponibile!"

5. **Conferma/Rifiuta**:
   - Clicca "✅ Conferma" o "❌ Rifiuta"
   - Verifica creazione prenotazione (se conferma)
   - Verifica notifica al prossimo (se rifiuta)

### Script di Test
```bash
# Verifica colonne database
node check-waitlist-columns.mjs

# Testa invio notifica manuale
node send-test-notification.mjs
```

## ⚙️ Configurazione Necessaria

### Variabili d'Ambiente (`.env.local`)
```bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=...

# VAPID per Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BI1mgGZVTXnfKm6Ijj...
VAPID_PRIVATE_KEY=4m8mOyup9ham9JUjl_YeUvHzCzMYrnsw8nwBrerZWHU
VAPID_EMAIL=davide431@outlook.it
```

### Installazione Dipendenze
```bash
npm install web-push
# (già installato)
```

## 📱 Compatibilità

### Browser Supportati
- ✅ Chrome/Edge (Android, Desktop, iOS 16.4+)
- ✅ Firefox (Android, Desktop)
- ✅ Safari (iOS 16.4+, macOS 13+)
- ❌ Opera Mini (no Service Workers)

### Note iOS/Safari
- Richiede iOS 16.4 o superiore
- Supporta solo Apple Push Notification Service
- Endpoint: `https://web.push.apple.com/...`
- Funziona anche con PWA installata

## 🐛 Troubleshooting

### Notifiche non arrivano
1. Controlla console browser: errori Service Worker?
2. Verifica sottoscrizioni in DB: `SELECT * FROM push_subscriptions WHERE user_id = '...'`
3. Testa API manualmente: `/api/push/test`
4. Controlla VAPID keys corrette

### Timer non si aggiorna
- UserWaitlist ha auto-refresh ogni 30s
- Forza refresh manuale con F5

### Offerta scaduta
- Scadenza automatica dopo 24 ore
- Status cambia a "expired"
- Non è possibile confermare offerte scadute

## 🔐 Sicurezza

### Validazioni
- ✅ Autenticazione richiesta per tutte le API
- ✅ Verifica proprietà waitlist entry (user_id)
- ✅ Rate limiting su API bookings
- ✅ Scadenza automatica offerte (24h)
- ✅ Rimozione automatica sottoscrizioni scadute

### Privacy
- Sottoscrizioni push associate a user_id
- Nessun dato sensibile nelle notifiche
- Endpoint push criptati (HTTPS only)

## 📊 Metriche

### Query Utili
```sql
-- Offerte attive
SELECT COUNT(*) FROM waitlist WHERE status = 'offered';

-- Tasso di accettazione
SELECT 
  COUNT(*) FILTER (WHERE offer_response = 'accepted') * 100.0 / COUNT(*) as acceptance_rate
FROM waitlist 
WHERE status IN ('approved', 'declined', 'expired');

-- Utenti in lista per giorno
SELECT date, COUNT(*) 
FROM waitlist 
WHERE status = 'waiting' 
GROUP BY date 
ORDER BY date;

-- Sottoscrizioni push attive
SELECT COUNT(*) FROM push_subscriptions;
```

## ✅ Checklist Deployment

- [x] Database: colonne waitlist aggiunte
- [x] API: `/api/notifications/send-waitlist-alert` creata
- [x] API: `/api/waitlist/respond` creata
- [x] API: `/api/bookings` modificata (PUT/PATCH)
- [x] UI: `UserWaitlist.tsx` aggiornato
- [x] Service Worker: push handlers aggiunti
- [x] Test: notifiche funzionano
- [ ] Production: NEXTAUTH_URL aggiornato
- [ ] Production: ngrok → dominio reale
- [ ] Monitoring: log notifiche inviate

## 🎓 Risorse

- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [VAPID Keys](https://web.dev/push-notifications-web-push-protocol/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Next.js PWA](https://github.com/DuCanh27/next-pwa)

---

**Implementazione completata**: 9 Ottobre 2025
**Versione**: 1.0.0
**Autore**: GitHub Copilot + David (Maskio Barber)
