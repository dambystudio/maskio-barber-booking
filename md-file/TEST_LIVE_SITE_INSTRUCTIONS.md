# 🎯 ISTRUZIONI PER TESTARE SUL SITO LIVE

## Dopo il deploy di Vercel (attendere 1-2 minuti)

### Step 1: Apri il sito
```
https://maskio-barber.vercel.app/prenota
```

### Step 2: Apri DevTools
- Premi **F12**
- Vai alla tab **Console**
- Click sul cestino per pulire la console

### Step 3: Seleziona Michele
- Nel form, click su "Seleziona Barbiere"
- Seleziona "Michele"

### Step 4: Verifica i Log nella Console

Dovresti vedere questi log in QUESTO ORDINE:

```
✅ Loaded barber closures for Michele: [0, 4]
```
↑ Questo conferma che giovedì (4) è normalmente chiuso

```
🔍 Processing batch availability for 60 dates
```
↑ Questo conferma che l'API è stata chiamata

```
🔍 DEBUG Oct 30: {
  dateString: "2025-10-30",
  hasSlots: true,           ← DEVE ESSERE TRUE
  availableCount: 14,
  totalSlots: 14,
  isRecurringClosed: true,  ← DEVE ESSERE TRUE
  willBeExceptional: true   ← DEVE ESSERE TRUE
}
```
↑ Questo è il log più importante!

```
🔓 2025-10-30: EXCEPTIONAL OPENING (hasSlots=true, normally closed)
```
↑ Questo conferma che è stato aggiunto a exceptionalOpenings

```
📊 Exceptional openings found: 1 ["2025-10-30"]
```
↑ Questo conferma che exceptionalOpenings contiene Oct 30

### Step 5: Verifica Visiva

Scorri il calendario fino a trovare **30 ottobre (Giovedì)**

**EXPECTED (Corretto):**
- ✅ Bottone **NON grigio** (bianco/colorato)
- ✅ Bottone **CLICCABILE**
- ✅ Click mostra gli slot orari

**BROKEN (Se ancora non funziona):**
- ❌ Bottone **grigio**
- ❌ Bottone **NON cliccabile**
- ❌ Badge "Chiuso" visibile

---

## 🔍 Debugging in Base ai Log

### Scenario A: `hasSlots: false`
**Problema:** API non ritorna slot disponibili

**Cosa fare:**
```bash
node check-live-site-issue.mjs
```
Verifica che il database abbia day_off=false

### Scenario B: `isRecurringClosed: false`
**Problema:** barberClosedDays non contiene giovedì (4)

**Cosa fare:**
Controlla il log precedente:
```
✅ Loaded barber closures for Michele: [0, 4]
```
Se NON contiene 4, il problema è l'API recurring closures

### Scenario C: `willBeExceptional: false`
**Problema:** Logica AND fallisce

**Causa:** hasSlots è false OPPURE isRecurringClosed è false

### Scenario D: Log `🔓 EXCEPTIONAL OPENING` NON appare
**Problema:** La condizione `if (availability.hasSlots && isRecurringClosed)` è falsa

**Debugger in Browser Console:**
Dopo aver selezionato Michele, esegui in console:
```javascript
// Controlla se la variabile exceptionalOpenings esiste ed è popolata
console.log('Exceptional Openings:', exceptionalOpenings);
console.log('Has Oct 30?', exceptionalOpenings.has('2025-10-30'));
```

---

## 📸 Screenshot Richiesto

Se il problema persiste, fai screenshot di:

1. **Console completa** dopo aver selezionato Michele
2. **Bottone 30 ottobre** nel calendario (per mostrare se è grigio)
3. **Network tab** → Filtro "batch-availability" → Response

E mandameli per analisi.

---

## ⚡ Quick Test - Esegui nella Console Browser

Dopo aver aperto il sito e selezionato Michele, esegui:

```javascript
// Test rapido
fetch('https://maskio-barber.vercel.app/api/bookings/batch-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    barberId: 'michele',
    dates: ['2025-10-30']
  })
})
.then(r => r.json())
.then(data => {
  console.log('🧪 API Test Result:', data);
  console.log('Oct 30 hasSlots:', data.availability['2025-10-30'].hasSlots);
});
```

Questo deve stampare:
```
Oct 30 hasSlots: true ✅
```

Se stampa `false`, il problema è nell'API backend.
Se stampa `true`, il problema è nel frontend.
