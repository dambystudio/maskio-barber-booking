# Schema Waitlist Semplificato ✅

## Problema Risolto

Lo schema waitlist conteneva campi non necessari perché la lista d'attesa funziona per **giorno intero**, non per slot specifici. Quando un posto si libera in un giorno, TUTTI gli utenti in lista vengono notificati (broadcast) e chi prenota per primo si prende il posto.

## Campi Rimossi ❌

- ❌ **time** - Orario desiderato (non serve, la waitlist è per l'intero giorno)
- ❌ **service** - Servizio desiderato (non necessario)
- ❌ **price** - Prezzo (non necessario)
- ❌ **offered_time** - Orario offerto (legacy, non usato)
- ❌ **offered_booking_id** - ID prenotazione offerta (legacy)
- ❌ **offer_expires_at** - Scadenza offerta (legacy)
- ❌ **offer_response** - Risposta offerta (legacy)

## Campi Mantenuti ✅

```sql
waitlist
├── id                  UUID (PK)
├── user_id             UUID (FK → users) - NULL per guest
├── barber_id           VARCHAR(50) (FK → barbers)
├── barber_name         VARCHAR(255)
├── date                VARCHAR(10) - YYYY-MM-DD
├── customer_name       VARCHAR(255)
├── customer_email      VARCHAR(255)
├── customer_phone      VARCHAR(20)
├── notes               TEXT
├── status              VARCHAR(20) - 'waiting' | 'notified' | 'cancelled' | 'booked'
├── position            INTEGER - Posizione nella coda (FIFO)
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

## Totale Colonne

- **Prima**: 20 colonne
- **Dopo**: 13 colonne
- **Rimosse**: 7 colonne

## Modifiche al Codice

### 1. Schema TypeScript (`src/lib/schema.ts`)

```typescript
export const waitlist = pgTable('waitlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  barberId: varchar('barber_id', { length: 50 }).notNull().references(() => barbers.id),
  barberName: varchar('barber_name', { length: 255 }).notNull(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 20 }),
  notes: text('notes'),
  status: varchar('status', { length: 20 }).default('waiting'),
  position: integer('position').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 2. API `/api/waitlist` (POST)

**Prima**:
```typescript
const { barberId, date, time, customerName, customerEmail, customerPhone, service, price } = body;
const waitlistTime = time || '00:00';
```

**Dopo**:
```typescript
const { barberId, date, customerName, customerEmail, customerPhone } = body;
```

**INSERT**:
```sql
-- Prima
INSERT INTO waitlist (user_id, barber_id, barber_name, date, time, service, price, ...)

-- Dopo
INSERT INTO waitlist (user_id, barber_id, barber_name, date, ...)
```

### 3. API `/api/waitlist/notify` (POST)

**Prima**:
```typescript
const { barberId, date, time } = await request.json();
if (!barberId || !date || !time) { ... }
```

**Dopo**:
```typescript
const { barberId, date } = await request.json();
if (!barberId || !date) { ... }
```

**Notifica**:
```typescript
// Prima
body: `${barberName} è libero il ${date} alle ${time}. Prenota subito!`
url: `/prenota?barber=${barberId}&date=${date}&time=${time}`

// Dopo
body: `${barberName} ha posti disponibili il ${date}. Prenota subito!`
url: `/prenota?barber=${barberId}&date=${date}`
```

### 4. Test (`test-waitlist-complete.mjs`)

**Prima**:
```javascript
const TEST_BOOKING = {
  date: '2025-12-05',
  time: '10:00',
  service: 'Taglio Uomo',
  price: 18
};

// Loop per ogni slot
for (const time of ALL_SLOTS) {
  await fetch('/api/waitlist/notify', {
    body: JSON.stringify({ barberId, date, time, service })
  });
}
```

**Dopo**:
```javascript
const TEST_BOOKING = {
  date: '2025-11-05', // Cambiato anche la data!
};

// Una sola notifica per giorno
await fetch('/api/waitlist/notify', {
  body: JSON.stringify({ barberId, date })
});
```

## Migration Database

Eseguita con successo:

```bash
node drop-waitlist-columns.mjs
```

Output:
```
📋 Colonne PRIMA: 20
📋 Colonne DOPO: 13
✅ Rimosse: 7 colonne
```

## Come Funziona Ora

### Iscrizione Waitlist

1. Utente va su giorno **arancione** (parzialmente occupato)
2. Click sul giorno → Apre `WaitlistModal`
3. Compila form con nome, email, telefono, note (opzionali)
4. Iscrizione salvata con **date** (giorno intero), **NON** con time specifico

### Notifica Broadcast

1. Slot si libera (prenotazione cancellata)
2. Sistema chiama `/api/waitlist/notify` con `{ barberId, date }`
3. **TUTTI** gli utenti in lista per quel giorno ricevono notifica
4. **First-come, first-served**: chi prenota per primo si prende il posto

### Benefici

✅ Schema più pulito e chiaro
✅ Meno confusione su "orario desiderato" vs "orario disponibile"
✅ API più semplici (meno parametri)
✅ Logica più coerente con il concetto di "lista d'attesa per giorno"
✅ Database più leggero (7 colonne in meno)

## File Modificati

1. ✅ `src/lib/schema.ts` - Schema semplificato
2. ✅ `src/app/api/waitlist/route.ts` - API principale
3. ✅ `src/app/api/waitlist/notify/route.ts` - API notifiche
4. ✅ `test-waitlist-complete.mjs` - Test aggiornato
5. ✅ Database - Colonne rimosse

## Backup

È stata creata una tabella di backup temporaneo:
```sql
waitlist_backup_temp
```

Per eliminarla (quando sei sicuro):
```sql
DROP TABLE waitlist_backup_temp;
```

## Test

Ora puoi eseguire il test completo:

```bash
node test-waitlist-complete.mjs
```

Il test ora:
- ✅ Usa la data `2025-11-05` (5 novembre 2025)
- ✅ Invia UNA sola notifica per giorno (non 14 per slot)
- ✅ Non richiede più `time`, `service`, `price`
- ✅ Più veloce e pulito

## Note

- I record vecchi nel database potrebbero avere ancora `time`, `service`, `price` popolati se sono stati creati prima della migration
- Le colonne sono state **fisicamente rimosse** dal database, quindi anche i dati vecchi sono stati persi
- Backup disponibile in `waitlist_backup_temp` se serve recuperare dati
