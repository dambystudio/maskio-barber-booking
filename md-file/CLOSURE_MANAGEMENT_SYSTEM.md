# Sistema di Gestione Chiusure Automatiche

## 📋 Panoramica

Il sistema genera automaticamente chiusure ricorrenti per ciascun barbiere secondo le loro esigenze:
- **Michele**: Chiusura mattutina ogni lunedì
- **Fabio**: Chiusura intera giornata ogni lunedì
- **Nicolò**: Chiusura mattutina tutti i giorni (Lun-Sab)

**✅ IMPORTANTE**: I barbieri possono vedere e modificare queste chiusure dal proprio pannello.

## 🔄 Comportamento del Sistema

### 1. Creazione Automatica (daily-update)

Il sistema esegue automaticamente ogni giorno e:
- Genera slot universali per tutti i barbieri (stessi orari base)
- Crea chiusure automatiche dove necessarie (`created_by = 'system-auto'`)
- **NON sovrascrive** chiusure già esistenti
- **NON ricrea** chiusure rimosse manualmente dai barbieri

### 2. Modifica da Pannello Barbiere

Quando un barbiere elimina una chiusura automatica dal proprio pannello:

```typescript
// L'API /api/barber-closures fa:
// 1. Elimina la chiusura
await sql`DELETE FROM barber_closures WHERE id = ${closureId}`;

// 2. Registra la rimozione manuale
await sql`
  INSERT INTO barber_removed_auto_closures (
    barber_email,
    closure_date,
    closure_type,
    removed_by,
    reason
  ) VALUES (
    ${barberEmail},
    ${date},
    ${closureType},
    ${barberEmail},
    'Apertura eccezionale'
  )
`;
```

### 3. Rispetto delle Preferenze

Il daily-update verifica **3 condizioni** prima di creare una chiusura:

```typescript
async function createAutoClosureIfNeeded(barberEmail, date, dayOfWeek) {
  // 1. Questa data/barbiere necessita chiusura automatica?
  const closureType = getAutoClosureType(barberEmail, dayOfWeek);
  if (!closureType) return false; // No
  
  // 2. Esiste già la chiusura?
  const existing = await sql`SELECT id FROM barber_closures WHERE ...`;
  if (existing.length > 0) return false; // Sì, non duplicare
  
  // 3. ✨ È stata rimossa manualmente dal barbiere?
  const wasRemoved = await sql`
    SELECT id FROM barber_removed_auto_closures WHERE ...
  `;
  if (wasRemoved.length > 0) return false; // ✅ RISPETTA LA SCELTA
  
  // Solo se tutte le condizioni sono false, crea la chiusura
  await sql`INSERT INTO barber_closures ...`;
}
```

## 📊 Esempio Pratico

### Scenario: Nicolò vuole lavorare eccezionalmente il lunedì mattina

**1. Situazione iniziale** (generata automaticamente)
```
📅 Lunedì 15 Dicembre 2025
🔒 Chiusura mattutina automatica (created_by: 'system-auto')
   Orari disponibili: 15:00 - 18:00 (7 slot pomeriggio)
```

**2. Nicolò dal pannello**
```
Click su "Elimina chiusura mattutina"
Motivo: "Apertura eccezionale per clienti specifici"
```

**3. Sistema registra la rimozione**
```sql
-- Tabella: barber_removed_auto_closures
barber_email: 'nicolo@maskiobarber.com'
closure_date: '2025-12-15'
closure_type: 'morning'
removed_by: 'nicolo@maskiobarber.com'
reason: 'Apertura eccezionale per clienti specifici'
removed_at: '2025-12-10 10:30:00'
```

**4. Risultato immediato**
```
📅 Lunedì 15 Dicembre 2025
✅ Nessuna chiusura
   Orari disponibili: 09:00 - 18:00 (15 slot completi)
   Clienti possono prenotare anche la mattina
```

**5. Giorni successivi (daily-update gira ogni notte)**
```
🌙 Daily-update esegue:
  ✓ Verifica Nicolò su 15 Dicembre
  ✓ Serve chiusura mattutina? SÌ (è lunedì)
  ✓ Chiusura esiste già? NO
  ✓ È stata rimossa manualmente? SÌ ✅
  → NON ricrea la chiusura (rispetta scelta di Nicolò)
```

## 🗄️ Struttura Database

### Tabella: `barber_closures`
Chiusure attive (automatiche o manuali)
```sql
id: uuid
barber_email: varchar(255)
closure_date: varchar(10)         -- YYYY-MM-DD
closure_type: varchar(20)         -- 'full', 'morning', 'afternoon'
reason: text
created_by: varchar(255)          -- 'system-auto', email barbiere, email admin
created_at: timestamp
updated_at: timestamp
```

### Tabella: `barber_removed_auto_closures`
Tracciamento rimozioni manuali (impedisce ricreazione)
```sql
id: uuid
barber_email: varchar(255)
closure_date: varchar(10)         -- YYYY-MM-DD
closure_type: varchar(20)         -- 'full', 'morning', 'afternoon'
removed_by: varchar(255)          -- Chi ha rimosso
reason: text                      -- Motivo rimozione
removed_at: timestamp
UNIQUE(barber_email, closure_date, closure_type)
```

## 🎯 Vantaggi del Sistema

### ✅ Per i Barbieri
- **Controllo totale**: Possono modificare/eliminare qualsiasi chiusura
- **Aperture eccezionali**: Rimuovere chiusure per lavorare in giorni normalmente chiusi
- **Nessun override**: Il sistema rispetta le loro decisioni
- **Interfaccia semplice**: Dal pannello vedono tutte le chiusure (auto + manuali)

### ✅ Per il Sistema
- **Automazione**: Crea chiusure necessarie senza intervento manuale
- **Coerenza**: Regole uniformi applicate automaticamente
- **Flessibilità**: I barbieri possono fare eccezioni quando necessario
- **Tracciabilità**: Ogni modifica è registrata con motivo e timestamp

### ✅ Per i Clienti
- **Slot corretti**: Vedono solo orari effettivamente disponibili
- **Nessuna confusione**: Slot chiusi non vengono mostrati
- **Prenotazioni valide**: Non possono prenotare in orari chiusi

## 🔧 Implementazione API

### GET /api/barber-closures
Lista tutte le chiusure del barbiere loggato
```typescript
// Risposta
{
  closures: [
    {
      id: "uuid",
      date: "2025-12-15",
      type: "morning",
      reason: "Chiusura mattutina standard",
      createdBy: "system-auto",  // ← Indica chiusura automatica
      isAutomatic: true
    },
    {
      id: "uuid",
      date: "2025-12-25",
      type: "full",
      reason: "Natale",
      createdBy: "admin@maskiobarber.com",
      isAutomatic: false
    }
  ]
}
```

### DELETE /api/barber-closures/:id
Elimina una chiusura
```typescript
// Se è una chiusura automatica (created_by = 'system-auto'):
// 1. Elimina dalla tabella barber_closures
// 2. Registra in barber_removed_auto_closures
// 3. Risposta success

// Se è una chiusura manuale:
// 1. Elimina dalla tabella barber_closures
// 2. Non registra in removed (non serve)
// 3. Risposta success
```

### POST /api/barber-closures
Crea nuova chiusura manuale
```typescript
// Corpo richiesta
{
  date: "2025-12-30",
  type: "afternoon",
  reason: "Appuntamento personale"
}

// Il sistema crea con created_by = email_barbiere_loggato
```

## 📝 Note Importanti

1. **Chiusure automatiche future**: Quando il daily-update genera date future (60 giorni avanti), crea automaticamente le chiusure necessarie

2. **Rimozioni permanenti**: Una volta rimossa, la chiusura automatica non viene più ricreata per quella data specifica

3. **Pulizia dati**: Le rimozioni vecchie (es. > 90 giorni nel passato) possono essere eliminate automaticamente per performance

4. **Conflitti**: Non possibile prenotare slot in orari chiusi (frontend filtra, API valida)

## 🚀 Prossimi Passi

1. ✅ Eseguire migrazione SQL per creare `barber_removed_auto_closures`
2. ✅ Deploy del nuovo codice daily-update
3. ⏳ Aggiornare API `/api/barber-closures` con logica rimozione tracking
4. ⏳ Testare workflow completo: crea → rimuove → daily-update non ricrea
5. ⏳ UI pannello barbiere: mostrare distintamente chiusure automatiche vs manuali
