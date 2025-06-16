# ANALISI IMPATTO CAMBIO EMAIL MICHELE - REPORT COMPLETO

## RIEPILOGO SITUAZIONE ATTUALE
Michele attualmente usa l'email `micheleprova@gmail.com` nel sistema, ma nella configurazione dei barbieri nel database usa `michele@maskiobarber.com`. Questo crea una situazione di mismatch che richiede attenzione.

## EMAIL ATTUALI DI MICHELE NEL SISTEMA:
1. **Email reale (autenticazione)**: `micheleprova@gmail.com` - usata in `.env.local` BARBER_EMAILS
2. **Email fittizia (database)**: `michele@maskiobarber.com` - usata negli script di setup database

## IMPATTO CAMBIO EMAIL - COSA CAMBIARE

### 1. CONFIGURAZIONE AUTORIZZAZIONI (.env.local)
**File**: `.env.local`
**Linea**: 10
```bash
BARBER_EMAILS=fabio.cassano97@icloud.com,micheleprova@gmail.com
```
**AZIONE**: Sostituire `micheleprova@gmail.com` con la nuova email

### 2. PANNELLO PRENOTAZIONI (Frontend)
**File**: `src/app/pannello-prenotazioni/page.tsx`
**Linee**: 83, 89, 924

Mapping hardcoded dell'email nel frontend:
```typescript
// Linea 83
const [selectedClosureBarber, setSelectedClosureBarber] = useState('all'); // 'all', 'fabio.cassano97@icloud.com', 'micheleprova@gmail.com'

// Linea 89
const barberEmailToName = {
  'fabio.cassano97@icloud.com': 'Fabio Cassano',
  'micheleprova@gmail.com': 'Michele Prova'  // <- CAMBIARE QUI
};

// Linea 924
<option value="micheleprova@gmail.com">Michele Prova</option>  // <- CAMBIARE QUI
```

### 3. PANNELLO PRENOTAZIONI BACKUP (page_new.tsx)
**File**: `src/app/pannello-prenotazioni/page_new.tsx`
**Linea**: 87
```typescript
'micheleprova@gmail.com': 'Michele Prova'  // <- CAMBIARE QUI
```

### 4. BACKUP DEL PANNELLO PRENOTAZIONI
**File**: `src/app/pannello-prenotazioni/page.tsx.backup2`
**Linee**: 86, 92, 872
Stesso pattern del file principale.

### 5. SCRIPT DI TEST E DEBUGGING
Tutti questi script hanno l'email hardcoded e vanno aggiornati:

**check-recurring-closures.mjs** (linea 35)
```javascript
WHERE barber_email = 'micheleprova@gmail.com'
```

**check-recurring-closures-correct.mjs** (linea 25)
```javascript
WHERE barber_email = 'micheleprova@gmail.com'
```

**add-thursday-closure-michele.mjs** (linee 13, 34, 46, 55)
```javascript
WHERE barber_email = 'micheleprova@gmail.com'
// e
VALUES ('micheleprova@gmail.com', '[0,4]', 'admin')
```

**test-profile-api.mjs** (linea 18)
```javascript
const testEmails = ['davide431@outlook.it', 'micheleprova@gmail.com'];
```

### 6. SCRIPT SETUP DATABASE (OPZIONALI)
Questi script usano email fittizie ma potrebbero essere aggiornati per consistenza:

**update-database.mjs** (linea 71)
```javascript
email: 'michele@maskiobarber.com',
```

**recreate-database.mjs** (linea 153)
```javascript
email: 'michele@maskiobarber.com',
```

## PROCEDURA CAMBIO EMAIL MICHELE

### STEP 1: Aggiornare .env.local
1. Cambiare `BARBER_EMAILS=fabio.cassano97@icloud.com,NUOVA_EMAIL_MICHELE`

### STEP 2: Aggiornare Frontend (pannello-prenotazioni)
1. Sostituire l'email nel mapping `barberEmailToName`
2. Aggiornare l'option value nella select delle chiusure

### STEP 3: Aggiornare Database (se necessario)
1. Aggiornare la tabella `barber_recurring_closures` con la nuova email
2. Aggiornare la tabella `barbers` se contiene l'email

### STEP 4: Aggiornare Script di Test
1. Cercare e sostituire `micheleprova@gmail.com` in tutti i file .mjs

### STEP 5: Test
1. Verificare che Michele possa ancora accedere al pannello
2. Testare le chiusure specifiche di Michele
3. Verificare autorizzazioni API

## SCRIPT DI MIGRAZIONE EMAIL
Per facilitare il cambio, si potrebbe creare uno script che:
1. Aggiorna tutte le occorrenze nel database
2. Aggiorna i file di configurazione
3. Esegue test di verifica

## RISCHI E CONSIDERAZIONI
1. **Perdita accesso temporaneo**: Michele non potrà accedere finché non si logga con la nuova email
2. **Chiusure esistenti**: Le chiusure legate alla vecchia email potrebbero non essere più visibili
3. **Prenotazioni esistenti**: Verificare che le prenotazioni esistenti rimangano collegate
4. **Cache frontend**: Potrebbe essere necessario pulire la cache del browser

## IMPATTO SU ALTRI BARBIERI
Il cambio email di Michele **NON** impatta:
- Fabio e le sue configurazioni
- Il sistema di autenticazione generale
- Le prenotazioni di altri barbieri
- Le API generali del sistema

## LIVELLO DI CRITICITÀ: MEDIO
Il cambio è fattibile ma richiede attenzione a tutti i punti hardcoded. Il sistema è stato progettato con email hardcoded in più punti, quindi serve un approccio sistematico.

## RACCOMANDAZIONE
1. **Creare script di migrazione** per automatizzare il processo
2. **Testare in ambiente di sviluppo** prima del cambio in produzione
3. **Considerare un refactor futuro** per centralizzare la configurazione barbieri
4. **Documentare la nuova email** in tutti i file README e documentazione

## FILES DA MODIFICARE (RIEPILOGO)
1. `.env.local` - BARBER_EMAILS
2. `src/app/pannello-prenotazioni/page.tsx` - mapping email e select
3. `src/app/pannello-prenotazioni/page_new.tsx` - mapping email
4. Tutti i file `.mjs` che contengono test/script specifici per Michele
5. Database: tabelle `barber_recurring_closures` e `barbers` (se contengono email reali)

TOTALE: ~10-15 file da modificare più aggiornamento database
