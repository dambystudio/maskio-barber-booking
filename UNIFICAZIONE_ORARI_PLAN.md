# ANALISI E PIANO DI UNIFICAZIONE REGOLE ORARI

## 📋 SITUAZIONE ATTUALE

### File che gestiscono gli orari:

1. **`src/app/api/system/daily-update/route.ts`**
   - Genera schedule per i prossimi 60 giorni
   - Ha logica hardcoded per Michele/Fabio lunedì
   - Crea automaticamente chiusure mattutine per Nicolò

2. **`src/app/api/bookings/slots/route.ts`** 
   - Genera slot "al volo" per il frontend
   - Ha logica per Michele lunedì, Fabio chiuso lunedì
   - Non sa nulla di Nicolò

3. **`src/lib/database-postgres.ts`** (generateStandardSlots)
   - Ha altra logica per generare slot
   - Duplicazione della logica slots

### Tabelle database:

1. **`barber_schedules`** - Schedule giornalieri
   - `available_slots`: JSON array di orari disponibili
   - `day_off`: boolean per giorno chiuso
   
2. **`barber_closures`** - Chiusure specifiche per data
   - `closure_type`: 'full' | 'morning' | 'afternoon'
   - Gestite manualmente dal pannello barbieri

3. **`barber_recurring_closures`** - Chiusure ricorrenti (es: tutti i lunedì)
   - `closed_days`: JSON array [0-6] (0=domenica, 1=lunedì, ecc.)

### Problemi attuali:

1. ❌ Logica orari duplicata in 3 posti diversi
2. ❌ Slot 18:00 non uniformi (solo Nicolò e Michele lunedì)
3. ❌ Regole hardcoded per barbieri specifici
4. ❌ Gli slot "chiusi" vengono mostrati nel frontend (solo unavailable)
5. ❌ Sistema di chiusure automatiche solo per Nicolò

## 🎯 NUOVE REGOLE UNIVERSALI

### Slot BASE per tutti i barbieri:

**Lunedì:**
- Mattina: 09:00-12:30 (8 slot)
- Pomeriggio: 15:00-18:00 (7 slot)
- **TOTALE: 15 slot**

**Martedì-Venerdì:**
- Mattina: 09:00-12:30 (8 slot)  
- Pomeriggio: 15:00-17:30 (6 slot)
- **TOTALE: 14 slot**

**Sabato:**
- Mattina: 09:00-12:30 (8 slot)
- Pomeriggio: 14:30-17:00 (6 slot, senza 17:30)
- **TOTALE: 14 slot**

**Domenica:** CHIUSO (sempre)

### Chiusure AUTOMATICHE (create dal daily-update):

1. **Michele** - Lunedì mattina
   - Tipo: 'morning'
   - Generata automaticamente ogni settimana
   
2. **Fabio** - Lunedì completo  
   - Tipo: 'full'
   - Generata automaticamente ogni settimana
   
3. **Nicolò** - Mattina tutti i giorni (Lun-Sab)
   - Tipo: 'morning' 
   - Generata automaticamente per ogni giorno

**IMPORTANTE:** Queste chiusure possono essere eliminate manualmente dal pannello barbieri per aprire eccezionalmente.

## 🔧 MODIFICHE NECESSARIE

### 1. `daily-update/route.ts` - Sistema di generazione schedule

**PRIMA:** Logica complicata con slot diversi per barbiere
```typescript
if (barberEmail === 'michele') return MICHELE_MONDAY_SLOTS;
if (barberEmail === 'fabio') return [];
```

**DOPO:** Slot universali + chiusure automatiche
```typescript
// SEMPRE gli stessi slot base per tutti
const slots = getUniversalSlots(dayOfWeek);

// POI crea chiusure automatiche
if (shouldCreateAutoClosure(barberEmail, dayOfWeek)) {
  await createBarberClosure(barberEmail, date, closureType);
}
```

### 2. `bookings/slots/route.ts` - API slot disponibili

**PRIMA:** Mostra tutti gli slot, anche quelli "chiusi" (solo unavailable)

**DOPO:** 
- Filtra gli slot in base alle chiusure
- NON mostra slot durante chiusure (mattina/pomeriggio)
- Rispetta sia chiusure ricorrenti che specifiche

### 3. Nuova funzione `getUniversalSlots(dayOfWeek)`

```typescript
const UNIVERSAL_SLOTS = {
  1: ['09:00'...'12:30', '15:00'...'18:00'], // Lunedì
  2-5: ['09:00'...'12:30', '15:00'...'17:30'], // Mar-Ven
  6: ['09:00'...'12:30', '14:30'...'17:00'], // Sabato
  0: [] // Domenica chiuso
};
```

### 4. Sistema chiusure automatiche

Il daily-update deve:
1. Generare SEMPRE gli stessi slot per tutti
2. Creare chiusure automatiche (se non esistono già):
   - Michele: lunedì morning
   - Fabio: lunedì full
   - Nicolò: ogni giorno morning

3. NON toccare chiusure esistenti (potrebbero essere state modificate manualmente)

### 5. Frontend - Filtering degli slot

Quando si caricano gli slot per il booking form:
```typescript
// Se c'è closure 'morning': NON mostrare slot 09:00-12:30
// Se c'è closure 'afternoon': NON mostrare slot 14:30-18:00  
// Se c'è closure 'full': NON mostrare nessuno slot

const filteredSlots = allSlots.filter(slot => {
  if (hasMorningClosure && isMorningSlot(slot)) return false;
  if (hasAfternoonClosure && isAfternoonSlot(slot)) return false;
  if (hasFullClosure) return false;
  return true;
});
```

## 📊 VANTAGGI

1. ✅ **Codice unificato** - Una sola fonte di verità per gli slot
2. ✅ **Flessibilità** - I barbieri possono modificare le chiusure
3. ✅ **Manutenibilità** - Cambio regole in un solo posto
4. ✅ **UX migliore** - Gli slot chiusi non vengono nemmeno mostrati
5. ✅ **18:00 uniformato** - Tutti hanno 18:00 il lunedì

## 🚀 ORDINE DI IMPLEMENTAZIONE

1. Creare funzione `getUniversalSlots(dayOfWeek)`
2. Creare sistema chiusure automatiche in `daily-update`
3. Aggiornare `slots/route.ts` per filtrare slot chiusi
4. Testare con tutti e 3 i barbieri
5. Rimuovere vecchia logica hardcoded
6. Deploy e test finale
