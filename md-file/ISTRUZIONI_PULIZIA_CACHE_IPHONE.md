# 📱 ISTRUZIONI RAPIDE - Pulizia Cache iPhone

## Problema: Slot non visibili su telefono

### ✅ SOLUZIONE VELOCE

**Sul tuo iPhone, apri la PWA e vai su:**

```
/force-cache-clear
```

**Poi:**

1. Clicca **"🧪 Test API"**
   - Guarda nei log cosa dice
   - Se vedi "Slot disponibili: 10:00" → API funziona, è solo cache
   - Se non vedi slot → problema più serio

2. Clicca **"💣 Reset Completo"**
   - Aspetta che finisce
   - Verrai reindirizzato automaticamente a /prenota

3. Seleziona **Michele** → **5 dicembre 2025**
   - Ora dovresti vedere lo slot 10:00 disponibile

---

## Se ancora non funziona

### Opzione A: Cancella manualmente (iPhone)

1. **Impostazioni** → **Safari**
2. **Avanzate** → **Dati dei siti web**
3. Cerca **"dominical"**
4. Scorri verso sinistra → **Elimina**
5. Torna alla PWA

### Opzione B: Reinstalla PWA

1. Tieni premuto sull'icona PWA
2. **Rimuovi app**
3. Apri Safari → vai su **maskiobarberconcept.it**
4. Icona condivisione → **Aggiungi a Home**

---

## Debug: Verifica API da Desktop

Sul **computer**, apri:
```
https://dominical-kenneth-gasifiable.ngrok-free.dev/api/bookings/slots?barberId=michele&date=2025-12-05
```

Dovresti vedere nel JSON:
```json
{
  "slots": [
    { "time": "10:00", "available": true, ... },
    ...
  ]
}
```

Se `"available": true` per 10:00, allora API è corretta e problema è cache telefono.

---

## Nota per te (David)

Database conferma:
- ✅ 5 dicembre ha 14 slot totali
- ✅ 15 prenotazioni (13 valid + 2 extra fuori orario)
- ✅ 1 slot LIBERO: **10:00**

Se telefono ancora non mostra 10:00 dopo reset completo, problema potrebbe essere:
1. Frontend filter (BookingForm.tsx)
2. Service Worker cache troppo aggressivo
3. Network cache (ngrok)

In quel caso, guarda console browser mobile per errori.
