# 🚦 Sistema Rate Limiting SMS

## 📋 Funzionalità Implementate

### ✅ Limiti di Invio
- **Massimo 3 SMS** per numero di telefono
- **Finestra di 15 minuti** per il conteggio
- **Blocco di 30 minuti** dopo il limite raggiunto

### ✅ Logica di Reset
- **Reset automatico** dopo 15 minuti dalla prima richiesta
- **Sblocco automatico** dopo 30 minuti di blocco
- **Contatori persistenti** salvati su file

### ✅ UI Migliorata
- **Indicatore tentativi**: "Tentativi rimasti: X/3"
- **Countdown blocco**: "Riprova tra X minuti"
- **Bottone disabilitato** quando bloccato
- **Messaggi di errore** informativi

## 🔧 Configurazione

```typescript
const MAX_SMS_ATTEMPTS = 3;           // Massimo 3 SMS
const RATE_LIMIT_WINDOW_MINUTES = 15; // Finestra di 15 minuti
const BLOCK_DURATION_MINUTES = 30;    // Blocco di 30 minuti
```

## 📁 File Coinvolti

### Backend
- `src/lib/verification.ts` - Logica rate limiting
- `src/app/api/verification/send-sms/route.ts` - API endpoint
- `.sms-rate-limits.json` - Storage persistente dei limiti

### Frontend
- `src/components/PhoneVerification.tsx` - UI con indicatori

## 🎯 Scenari d'Uso

### Scenario 1: Primo Invio
```
✅ SMS inviato (Tentativi rimasti: 2/3)
```

### Scenario 2: Secondo Invio
```
✅ SMS inviato (Tentativi rimasti: 1/3)
```

### Scenario 3: Terzo Invio
```
✅ SMS inviato (Tentativi rimasti: 0/3)
```

### Scenario 4: Limite Raggiunto
```
🚫 Troppi tentativi. Riprova tra 30 minuti
[Bottone "Invia di nuovo" disabilitato]
```

### Scenario 5: Reset Automatico
```
Dopo 15 minuti dalla prima richiesta:
✅ Contatori resettati automaticamente
```

## 📊 Struttura Dati Rate Limit

```json
{
  "393381234567": {
    "phone": "393381234567",
    "attempts": 3,
    "firstAttempt": "2025-06-22T20:00:00.000Z",
    "lastAttempt": "2025-06-22T20:05:00.000Z",
    "blockedUntil": "2025-06-22T20:35:00.000Z"
  }
}
```

## 🔍 Log di Debug

```
🔒 Checking rate limit for 393381234567
🔒 First attempt for 393381234567
📝 Recording SMS attempt for 393381234567
🚫 Rate limit exceeded for 393381234567, blocking until...
```

## 🚀 Benefici

### ✅ Sicurezza
- Previene abusi e spam
- Protegge dai costi eccessivi
- Limita tentativi automatici

### ✅ User Experience
- Indicatori chiari dei limiti
- Countdown per sblocco
- Messaggi informativi

### ✅ Robustezza
- Persistenza tra riavvii
- Reset automatico
- Fallback in caso di errori

## 🔧 Test del Sistema

1. **Test normale**: Invia 3 SMS consecutivi
2. **Test limite**: Al 4° tentativo dovrebbe bloccare
3. **Test timeout**: Aspetta 30 minuti per sblocco
4. **Test reset**: Aspetta 15 minuti per reset contatore

## 📱 Messaggi di Errore

- `"Troppi tentativi. Riprova tra X minuti."` (Status 429)
- `"Limite di invii SMS raggiunto. Riprova più tardi."` (Generic)

Il sistema è ora robusto e protetto contro abusi mantenendo una buona user experience!
