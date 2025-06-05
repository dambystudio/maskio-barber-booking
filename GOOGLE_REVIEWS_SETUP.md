# 🔧 Guida per Configurare le Recensioni Google

## Passaggi per ottenere le recensioni reali di Google:

### 1. Creare un progetto Google Cloud
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita la **Google Places API**

### 2. Ottenere l'API Key
1. Vai su "Credenziali" → "Crea credenziali" → "Chiave API"
2. Copia la chiave API generata
3. (Opzionale) Imposta restrizioni per maggiore sicurezza

### 3. Trovare il Place ID della tua attività
1. Vai su [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Cerca "Maskio Barber" o il nome della tua attività
3. Copia il Place ID che appare

### 4. Configurare le variabili d'ambiente
Modifica il file `.env.local` con i tuoi dati:

```bash
# Google Places API Configuration
GOOGLE_PLACES_API_KEY=la_tua_chiave_api_qui
GOOGLE_PLACE_ID=il_place_id_della_tua_attività_qui
```

### 5. Riavviare il server
```bash
npm run dev
```

## Note importanti:
- ⚠️ **Attualmente vengono mostrate recensioni di esempio** perché l'API non è configurata
- 🔒 L'API Key dovrebbe essere mantenuta segreta
- 💰 Google Places API ha un piano gratuito con limiti di utilizzo
- 📝 Le recensioni vengono aggiornate automaticamente quando disponibili

## Costi Google Places API:
- Prime 100.000 richieste/mese: **GRATIS**
- Oltre: $17 per 1000 richieste aggiuntive

Per la maggior parte delle attività locali, il piano gratuito è sufficiente.
