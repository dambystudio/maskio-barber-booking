# 🔧 TROUBLESHOOTING WAITLIST - DEBUG GUIDE

## ✅ Modifiche Applicate

### 1. **API Waitlist Join - Logging Esteso**
- ✅ Aggiunto logging dettagliato per ogni step
- ✅ Log: session check, validazione, duplicati, inserimento DB
- ✅ Errori salvati con stack trace completo
- ✅ Response include tipo errore e dettagli

### 2. **Client Logger System**
- ✅ Creato `/api/log` per ricevere log da mobile/PWA
- ✅ Creato `clientLogger` utility per logging remoto
- ✅ Integrato in `WaitlistButton` con tracking completo
- ✅ Log automatico su server quando console non accessibile

### 3. **UI Improvements**
- ✅ Loading indicator più visibile durante debounce
- ✅ Impedito click su slot durante caricamento
- ✅ Messaggio "Nessun orario disponibile" migliorato
- ✅ Errori mostrati per 5 secondi con styling chiaro

### 4. **BookingForm Fixes**
- ✅ Loading state consolidato (`loading || isDebouncing`)
- ✅ Slot non renderizzati durante caricamento
- ✅ Animazione spinner migliorata

---

## 🧪 Come Testare (Step by Step)

### **STEP 1: Verifica dev server attivo**
```powershell
# Assicurati che il server sia running
$env:PORT=3001; npm run dev
```

### **STEP 2: Esegui test prenotazioni**
```powershell
# Occupa tutti gli slot del 5 dicembre 2025
node test-waitlist-complete.mjs
```

Segui le istruzioni del test fino a **STEP 5** (clic sul bottone waitlist)

### **STEP 3: Apri PWA da mobile**
1. Apri browser mobile
2. Vai su: https://dominical-kenneth-gasifiable.ngrok-free.dev
3. Login con: test@gmail.com
4. Naviga: Prenota → Fabio → Servizio → 5 Dicembre 2025

### **STEP 4: Clicca slot occupato e bottone waitlist**
- Clicca su uno slot rosso (occupato)
- Appare il WaitlistButton giallo
- Clicca "Aggiungi alla Lista d'Attesa"
- **Osserva** il comportamento

### **STEP 5: Controlla i log sul server**

**Nel terminale dove gira `npm run dev`** vedrai:
```
🔵 [WAITLIST JOIN] Inizio richiesta
🔵 [WAITLIST JOIN] Session: OK <userId>
🔵 [WAITLIST JOIN] Body ricevuto: { ... }
🔵 [WAITLIST JOIN] Validazione OK, controllo duplicati...
🔵 [WAITLIST JOIN] Iscrizioni esistenti: 0
🔵 [WAITLIST JOIN] Calcolo posizione...
🔵 [WAITLIST JOIN] Posizione calcolata: 1
🔵 [WAITLIST JOIN] Inserimento nel database...
✅ [WAITLIST JOIN] Inserimento completato: { id: 123, position: 1 }
```

**Se c'è un errore vedrai**:
```
❌ [WAITLIST JOIN] ERRORE: <dettagli>
❌ [WAITLIST JOIN] Stack: <stack trace>
```

### **STEP 6: Visualizza log remoti (opzionale)**

**Da browser desktop**, apri:
```
http://localhost:3001/api/log
```

Vedrai JSON con tutti i log inviati dal client mobile:
```json
{
  "success": true,
  "logs": [
    {
      "level": "info",
      "message": "[WAITLIST] JOIN_CLICKED",
      "details": { "barberId": "fabio", "date": "2025-12-05", ... },
      "user_agent": "Mozilla/5.0 ...",
      "url": "https://...",
      "created_at": "2025-10-10T..."
    },
    ...
  ]
}
```

### **STEP 7: Verifica database**

Dentro `test-waitlist-complete.mjs` (STEP 5), premi INVIO e vedrai:
```
🔍 Verifico nel database...
✅ Iscrizione trovata nel database!
   ID: 123
   Barbiere: Fabio
   Data: 2025-12-05
   Orario: 09:00
   Servizio: <servizio>
   Status: waiting
   Position: 1
```

**Se fallisce**:
```
❌ Nessuna iscrizione trovata nel database!
   Verifica che l'API funzioni correttamente.
```

---

## 🔍 Possibili Problemi e Soluzioni

### ❌ **"Nessuna iscrizione trovata nel database"**

**Cause possibili:**

1. **Session non valida su mobile**
   - **Check**: Guarda log server per `Session: MANCANTE`
   - **Fix**: Ri-login sulla PWA, controlla cookie

2. **Errore validazione input**
   - **Check**: Log server `Validazione fallita`
   - **Fix**: Verifica che tutti i campi siano popolati (barberId, date, time, service)

3. **Errore database**
   - **Check**: Log server `ERRORE: column "time" does not exist`
   - **Fix**: Ri-esegui migrazione: `node migrate-add-time-to-waitlist.mjs`

4. **Network error**
   - **Check**: Log client mostra errore fetch
   - **Fix**: Verifica connessione, ngrok attivo, CORS

5. **Duplicato**
   - **Check**: Log server `Duplicato trovato`
   - **Fix**: Cancella iscrizioni esistenti: 
     ```sql
     DELETE FROM waitlist WHERE user_id = '<userId>' AND date = '2025-12-05';
     ```

### ⚠️ **"Tutto Occupato" appare in ritardo**

**RISOLTO** con modifiche:
- Loading indicator consolidato
- Slot non cliccabili durante caricamento
- Check `!loading && !isDebouncing` prima di renderizzare slot

### 🐌 **Slot si caricano lentamente**

**Normale**: Debounce di 300ms per evitare rate limiting.

**Se troppo lento**:
1. Verifica cache slots funziona: log `💾 Using cached slots`
2. Riduci debounce da 300ms a 150ms in `BookingForm.tsx` (riga ~398)
3. Controlla performance database: query `getAvailableSlots`

### 🔴 **Errore "Error JSON pattern"**

**RISOLTO**: Colonna "time" mancava nel database, ora aggiunta con migrazione.

**Se persiste**:
- Verifica migrazione: `node migrate-add-time-to-waitlist.mjs` (dovrebbe dire "esiste già")
- Controlla schema: `SELECT column_name FROM information_schema.columns WHERE table_name = 'waitlist';`

---

## 📊 Log Analysis Checklist

Quando testi, verifica questa sequenza nei log:

### ✅ **Sequenza Corretta (Success)**
```
[CLIENT INFO] [WAITLIST] JOIN_CLICKED
[CLIENT INFO] [WaitlistButton] User authenticated
[CLIENT INFO] [WaitlistButton] Sending API request
🔵 [WAITLIST JOIN] Inizio richiesta
🔵 [WAITLIST JOIN] Session: OK
🔵 [WAITLIST JOIN] Body ricevuto
🔵 [WAITLIST JOIN] Validazione OK
🔵 [WAITLIST JOIN] Iscrizioni esistenti: 0
🔵 [WAITLIST JOIN] Calcolo posizione...
🔵 [WAITLIST JOIN] Posizione calcolata: 1
🔵 [WAITLIST JOIN] Inserimento nel database...
✅ [WAITLIST JOIN] Inserimento completato
[CLIENT INFO] [WaitlistButton] Response received { ok: true }
[CLIENT INFO] [WaitlistButton] Join successful!
```

### ❌ **Sequenza con Errore (Failure)**
```
[CLIENT INFO] [WAITLIST] JOIN_CLICKED
[CLIENT INFO] [WaitlistButton] User authenticated
[CLIENT INFO] [WaitlistButton] Sending API request
🔵 [WAITLIST JOIN] Inizio richiesta
🔵 [WAITLIST JOIN] Session: OK
🔵 [WAITLIST JOIN] Body ricevuto
❌ [WAITLIST JOIN] ERRORE: <dettagli>
[CLIENT INFO] [WaitlistButton] Response received { ok: false }
[CLIENT ERROR] [WaitlistButton] API error
```

---

## 🛠️ Comandi Utili

### **Pulisci database waitlist**
```javascript
// In test-waitlist-complete.mjs o console DB
await sql`DELETE FROM waitlist WHERE date = '2025-12-05'`;
```

### **Controlla iscrizioni**
```javascript
await sql`SELECT * FROM waitlist ORDER BY created_at DESC LIMIT 10`;
```

### **Verifica colonna "time"**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'waitlist' AND column_name = 'time';
```

### **Forza flush log client (da console browser)**
```javascript
import { clientLogger } from '@/lib/clientLogger';
await clientLogger.flush();
```

---

## 📱 Test su Mobile - Quick Checklist

Prima di testare da mobile:

- [ ] Dev server running su porta 3001
- [ ] Ngrok tunnel attivo e forwarding a 3001
- [ ] Test script ha occupato tutti gli slot del 5 dic 2025
- [ ] User test@gmail.com ha permesso notifiche
- [ ] Mobile connesso a internet (non localhost)
- [ ] Cache browser mobile pulita (hard refresh)
- [ ] Login effettuato su PWA mobile

---

## 🎯 Success Criteria

Il test è **PASSATO** se:

1. ✅ Bottone WaitlistButton appare quando clicchi slot occupato
2. ✅ Styling giallo gradient (come "Prenota Subito")
3. ✅ Clic sul bottone mostra "Iscrizione in corso..." con spinner
4. ✅ Appare messaggio verde "Iscritto alla lista d'attesa!" ✅
5. ✅ Log server mostra inserimento completato
6. ✅ Database contiene record con status 'waiting'
7. ✅ Test script (STEP 5) trova l'iscrizione

---

## 🚀 Next Steps After Success

1. **Test notifiche broadcast** (STEP 7 del test)
2. **Verifica dashboard waitlist** (`/dashboard/waitlist`)
3. **Test cancellazione iscrizione**
4. **Test con più utenti contemporaneamente**
5. **Deploy in produzione**

---

## 📞 Se Tutto Fallisce

**Ultimo resort - Debug manuale**:

1. Apri `src/app/api/waitlist/join/route.ts`
2. Aggiungi all'inizio del POST:
   ```typescript
   // FORCE SUCCESS - DEBUG ONLY
   return NextResponse.json({ 
     success: true, 
     message: 'Debug mode', 
     data: { waitlistId: 999, position: 1 } 
   });
   ```
3. Testa se frontend mostra successo
4. Se mostra successo → problema è nel backend (DB, validation, session)
5. Se non mostra successo → problema è nel frontend (fetch, error handling)
6. **RICORDA DI RIMUOVERE IL DEBUG CODE!**

---

**Buon testing! 🎉**
