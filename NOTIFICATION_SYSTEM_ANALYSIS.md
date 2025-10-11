# 🔔 Analisi Sistema Notifiche - Maskio Barber

## 📊 Stato Attuale del Sistema

### ✅ Funzionalità Esistenti

#### 1. **Sistema Waitlist (Lista d'Attesa)**
- ✅ Tabella `waitlist` nel database
- ✅ API complete:
  - `GET /api/waitlist` - Recupera lista d'attesa
  - `POST /api/waitlist` - Aggiunge utente alla lista
  - `DELETE /api/waitlist` - Rimuove utente dalla lista
  - `POST /api/waitlist/approve` - Approva prenotazione da waitlist

#### 2. **Infrastruttura Notifiche**
- ✅ Tabella `push_subscriptions` per PWA notifications
- ✅ Preferenze utente in `user_preferences`:
  - `notifications` (boolean)
  - `email_notifications` (boolean)
  - `sms_notifications` (boolean)
- ✅ Email service già configurato
- ✅ Sistema PWA già attivo

#### 3. **Componenti UI Esistenti**
- ✅ `WaitlistModal.tsx` - Modale per iscriversi alla lista
- ✅ `WaitlistPanel.tsx` - Pannello per barbieri
- ✅ `UserWaitlist.tsx` - Vista utente per vedere proprie iscrizioni
- ⚠️ `PWANotificationBanner` - Commentato (da riattivare)
- ⚠️ `NotificationSettings` - Commentato (da riattivare)

### 📋 Struttura Database

#### Tabella `waitlist`
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  barber_id VARCHAR(50) REFERENCES barbers(id),
  barber_name VARCHAR(255),
  date VARCHAR(10), -- YYYY-MM-DD
  service VARCHAR(255),
  price DECIMAL(10,2),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  notes TEXT,
  position INTEGER,
  status VARCHAR(20), -- 'waiting' | 'approved' | 'cancelled'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Tabella `push_subscriptions`
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

## 🎯 Piano di Integrazione Notifiche

### Fase 1: Attivazione Infrastruttura Base
1. ✅ Verificare configurazione PWA esistente
2. ⚠️ Riattivare `PWANotificationBanner` component
3. ⚠️ Creare service worker per gestione notifiche push
4. ⚠️ Implementare API per registrazione push subscriptions

### Fase 2: Logica Notifiche Waitlist
1. ⚠️ Creare API `/api/notifications/send-waitlist-alert`
2. ⚠️ Implementare trigger quando si libera uno slot:
   - Cancellazione prenotazione
   - Spostamento prenotazione
   - Modifica schedule barbiere
3. ⚠️ Logica di selezione utenti da notificare:
   - Priorità per posizione in lista
   - Filtro per preferenze notifiche attive
   - Gestione stato "notificato"

### Fase 3: Implementazione Multi-canale
1. ⚠️ **Push Notifications (PWA)**
   - Priorità: ALTA
   - Per utenti con app installata
   - Notifica real-time

2. ⚠️ **Email Notifications**
   - Priorità: MEDIA
   - Backup per chi non ha PWA
   - Usa servizio email esistente

3. ⚠️ **SMS Notifications** (Opzionale)
   - Priorità: BASSA
   - Per utenti premium
   - Richiede servizio SMS esterno

### Fase 4: UI/UX Miglioramenti
1. ⚠️ Riattivare `NotificationSettings` component
2. ⚠️ Aggiungere preferenze notifiche waitlist
3. ⚠️ Indicator visivo per utenti in waitlist
4. ⚠️ Badge notifiche su navbar
5. ⚠️ Centro notifiche in area personale

## 🔧 Tecnologie da Utilizzare

### Per Push Notifications (PWA)
```javascript
// Web Push API
const registration = await navigator.serviceWorker.ready;
await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
});
```

### Librerie Consigliate
- `web-push` - Per inviare notifiche push dal server
- `@capacitor/push-notifications` - Se si vuole supporto mobile nativo
- Esistente: `@neondatabase/serverless` per database
- Esistente: `nodemailer` per email

## 📝 Caso d'Uso Specifico: Notifica Slot Liberato

### Scenario
1. Cliente A ha un appuntamento alle 10:00
2. Clienti B, C, D sono in waitlist per quel giorno
3. Cliente A cancella/sposta l'appuntamento
4. Sistema deve notificare B (prima posizione in waitlist)

### Flusso di Lavoro

#### 1. Trigger Event (Cancellazione/Spostamento)
```typescript
// In /api/bookings o /api/booking-swap
async function onBookingFreed(booking: Booking) {
  // 1. Trova utenti in waitlist per quella data e barbiere
  const waitlistUsers = await sql`
    SELECT * FROM waitlist 
    WHERE date = ${booking.date} 
    AND barber_id = ${booking.barberId}
    AND status = 'waiting'
    ORDER BY position ASC
    LIMIT 5 -- Notifica i primi 5
  `;

  // 2. Invia notifiche
  for (const waitlistEntry of waitlistUsers) {
    await sendWaitlistNotification(waitlistEntry, booking);
  }
}
```

#### 2. Invio Notifica
```typescript
async function sendWaitlistNotification(
  waitlistEntry: WaitlistEntry, 
  freedSlot: { date: string, time: string, barberName: string }
) {
  const user = await getUserById(waitlistEntry.user_id);
  
  // Controlla preferenze
  if (!user.preferences?.notifications) return;

  // 1. Push Notification (se disponibile)
  if (user.pushSubscriptions?.length > 0) {
    await sendPushNotification(user, {
      title: '🎉 Posto Disponibile!',
      body: `Si è liberato un posto per ${freedSlot.barberName} il ${freedSlot.date} alle ${freedSlot.time}`,
      data: {
        type: 'waitlist_slot_freed',
        date: freedSlot.date,
        time: freedSlot.time,
        barberId: freedSlot.barberId
      }
    });
  }

  // 2. Email (se abilitata)
  if (user.preferences?.emailNotifications) {
    await sendEmail({
      to: user.email,
      subject: 'Posto Disponibile - Maskio Barber',
      template: 'waitlist-slot-freed',
      data: freedSlot
    });
  }

  // 3. Aggiorna stato waitlist
  await sql`
    UPDATE waitlist 
    SET status = 'notified', updated_at = NOW()
    WHERE id = ${waitlistEntry.id}
  `;
}
```

#### 3. Gestione Risposta Utente
```typescript
// Nuovo endpoint
POST /api/waitlist/claim-slot
{
  waitlistId: string,
  acceptSlot: boolean
}

// Se accetta:
// - Crea prenotazione automatica
// - Rimuove da waitlist
// - Notifica altri utenti se rifiuta

// Se rifiuta/non risponde in X minuti:
// - Passa al successivo in lista
```

## 🚀 Prossimi Passi Immediati

### Step 1: Setup Base Push Notifications ⏱️ 1-2 ore
1. Creare file `public/sw.js` (Service Worker)
2. Generare VAPID keys per web push
3. Creare API `/api/push/subscribe`
4. Creare API `/api/push/send`

### Step 2: Test Push Notifications ⏱️ 30 min
1. Implementare bottone "Abilita Notifiche" in area personale
2. Testare ricezione notifica
3. Verificare persistenza subscription

### Step 3: Integrare con Waitlist ⏱️ 2-3 ore
1. Aggiungere trigger in API bookings
2. Implementare logica selezione utenti
3. Creare template notifiche
4. Testare flusso completo

### Step 4: UI Improvements ⏱️ 1-2 ore
1. Badge notifiche non lette
2. Centro notifiche dropdown
3. Preferenze notifiche in impostazioni
4. Animazioni e feedback visivi

## 📊 Metriche di Successo
- ✅ Tasso di opt-in alle notifiche push > 40%
- ✅ Tempo risposta utente < 5 minuti
- ✅ Conversione waitlist → prenotazione > 60%
- ✅ Riduzione no-show tramite notifiche reminder

## ⚠️ Considerazioni Tecniche

### Browser Support
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ⚠️ Safari: Limited (iOS 16.4+)
- ❌ iOS Safari < 16.4: No push support

### Privacy & GDPR
- ✅ Richiesta consenso esplicito
- ✅ Opt-out facile
- ✅ Cancellazione dati su richiesta
- ✅ Trasparenza su uso dati

### Performance
- Notifiche batch per slot multipli
- Rate limiting per evitare spam
- Queue system per gestire picchi
- Retry logic per notifiche fallite

## 📚 Risorse Utili
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
