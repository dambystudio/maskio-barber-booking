# 📋 SISTEMA LISTA D'ATTESA - SPECIFICA DEFINITIVA

## 🎯 Come Funziona (Corretto)

### Scenario Utente

1. **Giorno con posti disponibili (Verde)** 🟢
   - Utente clicca sul giorno
   - Vede slot disponibili
   - Seleziona uno slot e prenota normalmente

2. **Giorno completamente occupato (Arancione)** 🟠
   - Utente clicca sul giorno arancione
   - Si apre **`WaitlistModal`**
   - Messaggio: *"Vuoi iscriverti alla lista d'attesa? Ti avviseremo quando si libera un posto"*
   - Utente inserisce dati e si iscrive
   - **NON specifica un orario** - accetta qualsiasi slot disponibile quel giorno

3. **Quando si libera UN QUALSIASI slot in quel giorno** 🔔
   - Sistema invia **notifica push BROADCAST** a TUTTI gli utenti in lista per quel giorno
   - Messaggio: *"Si è liberato un posto per il 5 dicembre! Prenota subito"*
   - **First-come-first-served**: chi clicca prima e prenota si prende il posto
   - Altri ricevono "slot occupato" se arrivano tardi

---

## 🏗️ Architettura Sistema

### Componenti Utilizzati

1. **`WaitlistModal.tsx`** ✅
   - Modal che si apre quando clicchi su un giorno arancione
   - Form con: nome, email, telefono (opzionale)
   - Bottone "Iscriviti alla lista d'attesa"
   - Chiamata API: `POST /api/waitlist`

2. **`BookingForm.tsx`** ✅
   - Giorni arancioni hanno `hasNoAvailableSlots: true`
   - Click su giorno arancione → `setShowWaitlistModal(true)`
   - Slot occupati (rossi) NON sono cliccabili
   - Legenda: "Occupato" (senza "clicca per lista d'attesa")

3. **`/api/waitlist/route.ts`** ✅
   - **POST**: Aggiunge utente alla lista per un GIORNO specifico
     - Campi: `barberId`, `date`, `customerName`, `customerEmail`, `customerPhone`
     - `time` impostato a `'00:00'` (indica "qualsiasi orario")
     - `status` iniziale: `'pending'`
     - Calcola `position` nella coda
   - **GET**: Recupera lista d'attesa per un utente
   - **DELETE**: Rimuove utente dalla lista

4. **`/api/waitlist/notify/route.ts`** ✅
   - **POST**: Invia notifiche broadcast quando si libera uno slot
   - Recupera TUTTI gli utenti in lista per `barberId` + `date`
   - Invia push notification a tutti simultaneamente
   - Aggiorna status da `'pending'` a `'notified'`

---

## 🗄️ Schema Database

```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),           -- Può essere NULL (guest)
  barber_id VARCHAR(50) NOT NULL,              -- 'fabio', 'michele', etc.
  barber_name VARCHAR(100),
  date DATE NOT NULL,                          -- YYYY-MM-DD
  time VARCHAR(5) DEFAULT '00:00',             -- SEMPRE '00:00' (qualsiasi orario)
  service VARCHAR(255),                        -- Opzionale
  price DECIMAL(10,2),                         -- Opzionale
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',        -- 'pending' | 'notified' | 'cancelled'
  position INTEGER NOT NULL,                   -- Posizione nella coda (informativo)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici
CREATE INDEX idx_waitlist_date ON waitlist(barber_id, date, status);
CREATE INDEX idx_waitlist_email ON waitlist(customer_email);
```

---

## 🔄 Flusso Completo

### 1. Iscrizione alla Lista

```
Utente clicca giorno arancione
    ↓
WaitlistModal si apre
    ↓
Utente compila form
    ↓
POST /api/waitlist
    - barberId: 'fabio'
    - date: '2025-12-05'
    - time: '00:00'  ← SEMPRE questo valore
    - customerName: 'Mario Rossi'
    - customerEmail: 'mario@example.com'
    - status: 'pending'
    - position: 1 (o successiva)
    ↓
Record salvato in database
    ↓
Modal mostra ✅ "Iscritto! Ti avviseremo quando si libera un posto"
```

### 2. Si Libera Uno Slot

```
Utente cancella prenotazione per 2025-12-05 alle 10:00
    ↓
Sistema chiama POST /api/waitlist/notify
    - barberId: 'fabio'
    - date: '2025-12-05'
    - time: '10:00' (opzionale, solo per info)
    ↓
API recupera TUTTI gli utenti con:
    - barber_id = 'fabio'
    - date = '2025-12-05'
    - status = 'pending'
    ↓
Per ogni utente:
    1. Recupera push subscriptions
    2. Invia notifica: "Si è liberato un posto per Fabio il 5 dicembre!"
    3. Aggiorna status → 'notified'
    ↓
TUTTI gli utenti ricevono notifica CONTEMPORANEAMENTE
    ↓
Chi clicca per primo e prenota → ottiene il posto
Chi arriva tardi → vede "slot occupato"
```

### 3. Prenotazione Post-Notifica

```
Utente riceve notifica push
    ↓
Clicca sulla notifica
    ↓
Si apre app/sito alla pagina prenotazioni
    ↓
Seleziona barbiere, data, QUALSIASI slot disponibile
    ↓
Completa prenotazione
    ↓
✅ SUCCESSO! Posto prenotato
    ↓
Altri utenti vedono slot occupato e devono scegliere altro
```

---

## ⚠️ Componenti DA NON USARE

### ❌ `WaitlistButton.tsx`
- **Perché esiste**: Creato per errore pensando a waitlist PER SLOT
- **Perché non serve**: La waitlist è per GIORNO, non per orario specifico
- **Stato**: Non importato/utilizzato, può essere eliminato

### ❌ `/api/waitlist/join/route.ts`
- **Perché esiste**: API alternativa per waitlist con `time` specifico
- **Perché non serve**: Usiamo `/api/waitlist` che usa `time='00:00'`
- **Stato**: Non chiamato da nessun componente attivo, può essere eliminato

### ❌ `WaitlistDashboard.tsx`
- **Cosa fa**: Mostra dashboard iscrizioni utente
- **Stato**: Può essere mantenuto per visualizzare le iscrizioni dell'utente
- **Pagina**: `/dashboard/waitlist` (opzionale)

---

## 🧪 Test Scenario

### Setup Test (test-waitlist-complete.mjs)

1. **Occupa tutti gli slot del 5 dicembre 2025 per Fabio**
   ```javascript
   ALL_SLOTS = ['09:00', '09:30', '10:00', ..., '17:30']; // 14 slot
   // Crea 14 prenotazioni per occupare tutto il giorno
   ```

2. **Giorno diventa arancione** (hasNoAvailableSlots: true)

3. **Utente clicca giorno arancione → WaitlistModal si apre**

4. **Utente si iscrive alla lista d'attesa**
   - API: `POST /api/waitlist`
   - Database: Record con `time='00:00'`, `status='pending'`

5. **Cancella TUTTE le prenotazioni del 5 dicembre**
   ```javascript
   DELETE FROM bookings WHERE barber_id='fabio' AND date='2025-12-05';
   ```

6. **Sistema invia notifiche broadcast**
   ```javascript
   POST /api/waitlist/notify
   {
     barberId: 'fabio',
     date: '2025-12-05',
     // time opzionale - notifica per QUALSIASI slot liberato
   }
   ```

7. **Utente riceve notifica push**
   - Titolo: "🎉 Posto disponibile!"
   - Messaggio: "Si è liberato un posto per Fabio il 5 dicembre! Prenota subito"
   - Click → app/sito

8. **Utente prenota uno dei 14 slot ora disponibili**
   - First-come-first-served

---

## 📊 Query Utili

### Verifica iscrizioni per un giorno

```sql
SELECT 
  customer_name,
  customer_email,
  time,  -- Deve essere '00:00'
  status,
  position,
  created_at
FROM waitlist
WHERE barber_id = 'fabio'
  AND date = '2025-12-05'
  AND status = 'pending'
ORDER BY position ASC;
```

### Pulisci iscrizioni test

```sql
DELETE FROM waitlist 
WHERE date = '2025-12-05' 
  AND customer_email = 'test@gmail.com';
```

### Conta iscrizioni per status

```sql
SELECT status, COUNT(*) as count
FROM waitlist
GROUP BY status;
```

---

## 🎨 UX/UI

### Giorni nel Calendario

- 🟢 **Verde**: Posti disponibili → click → mostra slot
- 🟠 **Arancione**: Tutto occupato → click → apre `WaitlistModal`
- 🔴 **Rosso**: Barbiere chiuso → non cliccabile

### Slot Orari

- ✅ **Disponibile**: Bianco/grigio → cliccabile
- ❌ **Occupato**: Rosso con linethrough → **NON cliccabile**

### WaitlistModal

```
┌─────────────────────────────────────┐
│         📋 Lista d'Attesa           │
│                                     │
│  Iscriviti per ricevere una         │
│  notifica quando si libera un posto │
│                                     │
│  📅 Fabio - 5 dicembre 2025        │
│                                     │
│  [Nome Cliente____________]         │
│  [Email Cliente___________]         │
│  [Telefono (opzionale)____]         │
│                                     │
│  💡 Riceverai una notifica push     │
│     quando si libera un posto.      │
│     Hai 24h per prenotare.          │
│                                     │
│  [Annulla]  [Iscriviti]            │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Checklist

- [x] WaitlistModal integrato in BookingForm
- [x] /api/waitlist con time='00:00' default
- [x] /api/waitlist/notify broadcast funzionante
- [x] Database con colonna `time` NOT NULL
- [x] Slot occupati NON cliccabili
- [x] Giorni arancioni aprono modale
- [ ] Rimuovere WaitlistButton da codebase (cleanup)
- [ ] Rimuovere /api/waitlist/join (cleanup)
- [ ] Test end-to-end completo
- [ ] Documentazione utente finale

---

## 💡 FAQ

**Q: Posso scegliere un orario specifico nella lista d'attesa?**
A: No. La lista d'attesa è per il GIORNO intero. Quando si libera qualsiasi slot, tutti vengono notificati.

**Q: Cosa succede se più persone provano a prenotare lo stesso slot?**
A: First-come-first-served. Chi completa la prenotazione per primo ottiene lo slot.

**Q: Posso iscrivermi a più giorni contemporaneamente?**
A: Sì, puoi avere iscrizioni multiple per giorni diversi.

**Q: Le notifiche scadono?**
A: Tecnicamente no, ma gli utenti dovrebbero prenotare entro tempi ragionevoli. Considera implementare scadenza 24h.

**Q: Posso vedere la mia posizione nella coda?**
A: La posizione è salvata nel DB ma è solo informativa. Le notifiche sono broadcast (tutti ricevono insieme).

---

**Documento creato il**: 10 ottobre 2025
**Ultima modifica**: 10 ottobre 2025
**Versione**: 1.0 (Definitiva)
