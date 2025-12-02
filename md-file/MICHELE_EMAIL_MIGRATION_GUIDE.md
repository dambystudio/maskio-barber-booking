# CAMBIO EMAIL MICHELE - GUIDA COMPLETA E SCRIPT

## RIEPILOGO DELL'ANALISI EFFETTUATA

### ✅ STATO ATTUALE SISTEMA:
- **Email attiva di Michele**: `michelebiancofiore0230@gmail.com`
- **Presente nel database**: Sì (tabella `barbers` e `barber_recurring_closures`)
- **Configurazione chiusure**: Domenica e Giovedì
- **Prenotazioni**: 1 prenotazione confermata trovata
- **Account utente**: Esistente con ruolo "barber"

### ⚠️ PROBLEMI IDENTIFICATI:
- Le variabili d'ambiente (.env.local) non vengono lette correttamente nello script
- Configurazione potenzialmente non coerente

### 📋 OCCORRENZE EMAIL TROVATE:
**Totale**: 13 occorrenze in 8 file

**File da modificare**:
1. `src/app/pannello-prenotazioni/page.tsx` (3 occorrenze)
2. `.env.local` (1 occorrenza)
3. `add-thursday-closure-michele.mjs` (4 occorrenze)
4. `check-recurring-closures-correct.mjs` (1 occorrenza)
5. `check-recurring-closures.mjs` (1 occorrenza)
6. `test-profile-api.mjs` (1 occorrenza)
7. Script di supporto creati (2 occorrenze)

## SCRIPT CREATI PER LA MIGRAZIONE

### 1. `search-michele-email.mjs`
**Scopo**: Trova tutte le occorrenze dell'email di Michele nel codebase
**Uso**: `node search-michele-email.mjs`

### 2. `migrate-michele-email.mjs`
**Scopo**: Script automatico per il cambio email (database + .env.local)
**Uso**: 
1. Modificare la variabile `NEW_EMAIL` nello script
2. Eseguire `node migrate-michele-email.mjs`

### 3. `analyze-michele-state.mjs`
**Scopo**: Analizza lo stato attuale di Michele nel sistema
**Uso**: `node analyze-michele-state.mjs`

## PROCEDURA CAMBIO EMAIL MICHELE

### PASSO 1: PREPARAZIONE
```bash
# 1. Fare backup del database
# 2. Fare backup di .env.local
# 3. Verificare che Michele non abbia sessioni attive
```

### PASSO 2: CONFIGURARE SCRIPT
```javascript
// In migrate-michele-email.mjs, modificare:
const NEW_EMAIL = 'nuova.email.michele@domain.com'; // <- INSERIRE EMAIL REALE
```

### PASSO 3: ESEGUIRE MIGRAZIONE AUTOMATICA
```bash
node migrate-michele-email.mjs
```

### PASSO 4: AGGIORNAMENTI MANUALI
Aggiornare manualmente questi file TypeScript:

**src/app/pannello-prenotazioni/page.tsx**:
```typescript
// Linea 89
'nuova.email.michele@domain.com': 'Michele Prova'

// Linea 924
<option value="nuova.email.michele@domain.com">Michele Prova</option>
```

### PASSO 5: AGGIORNARE SCRIPT DI TEST
Sostituire `michelebiancofiore0230@gmail.com` con la nuova email in:
- `add-thursday-closure-michele.mjs`
- `check-recurring-closures.mjs`
- `check-recurring-closures-correct.mjs`
- `test-profile-api.mjs`

### PASSO 6: VERIFICHE POST-MIGRAZIONE
```bash
# 1. Riavviare server
npm run dev

# 2. Verificare stato
node analyze-michele-state.mjs

# 3. Test accesso Michele
# - Michele deve disconnettersi e riconnettersi
# - Verificare accesso pannello prenotazioni
# - Testare chiusure giorni specifici
```

## SCRIPT VS CODE - SOSTITUZIONE RAPIDA

### Trova e Sostituisci in tutti i file:
```
Cerca: michelebiancofiore0230@gmail.com
Sostituisci: nuova.email.michele@domain.com
```

**Include**: `*.tsx,*.ts,*.js,*.mjs,*.env.local`
**Escludi**: `node_modules,.next,analyze-*,search-*,migrate-*`

## VERIFICA FINALE

### Checklist post-migrazione:
- [ ] ✅ Email aggiornata in .env.local
- [ ] ✅ Database aggiornato (barber_recurring_closures)
- [ ] ✅ Frontend aggiornato (pannello-prenotazioni)
- [ ] ✅ Script di test aggiornati
- [ ] ✅ Michele può accedere con nuova email
- [ ] ✅ Chiusure di Michele funzionano correttamente
- [ ] ✅ API autorizzazioni funzionano
- [ ] ✅ Prenotazioni Michele visibili solo a lui

## IMPATTO STIMATO

### ⏱️ Tempo necessario: 30-60 minuti
### 🔧 Complessità: Media
### 🚨 Rischio: Basso (con backup)
### 👥 Utenti impattati: Solo Michele

## ROLLBACK

In caso di problemi:
1. Ripristinare backup .env.local
2. Eseguire query SQL per ripristinare email nel database:
```sql
UPDATE barber_recurring_closures 
SET barber_email = 'michelebiancofiore0230@gmail.com' 
WHERE barber_email = 'nuova.email';

UPDATE barbers 
SET email = 'michelebiancofiore0230@gmail.com' 
WHERE email = 'nuova.email';
```
3. Ripristinare file TypeScript dal backup
4. Riavviare server

## SUPPORTO
Per assistenza durante la migrazione, consultare:
- `MICHELE_EMAIL_CHANGE_IMPACT.md` (report dettagliato)
- Script di analisi: `analyze-michele-state.mjs`
- Script di ricerca: `search-michele-email.mjs`
