# 🔧 Guida per Configurare le Recensioni Google

## ✅ **CONFIGURAZIONE COMPLETATA! 🎉**

**🎯 Place ID Maskio Barber: `<PLACE_ID>`**
**🔑 API Key Google: `<API_KEY>`**

### 📊 **STATO ATTUALE:**
✅ **COMPLETATO:** Place ID configurato nel file `.env.local`
✅ **COMPLETATO:** API Key Google Cloud creata
✅ **COMPLETATO:** Progetto Google Cloud "maskio-barber-reviews-api" creato
✅ **COMPLETATO:** Places API (New) abilitata su Google Cloud ✨
✅ **COMPLETATO:** Restrizioni API Key configurate correttamente
✅ **COMPLETATO:** API funzionante - recensioni Google caricate con successo! 🎉
✅ **COMPLETATO:** Dati attività recuperati: "Maskio barber concept" ⭐5/5 (4 recensioni)
⏳ **OPZIONALE:** Accesso My Business dal barbiere (per recensioni più dettagliate)

### 🎯 **CONFIGURAZIONE GOOGLE CLOUD COMPLETATA!**
- **Data configurazione:** 10 giugno 2025 11:53:36 GMT+2
- **API abilitate:** Places API (New) + Maps JavaScript API
- **Restrizioni:** Solo le 2 API necessarie

### 🔧 **AZIONI IMMEDIATE DA FARE:**
1. **Su Google Cloud Console → API e Servizi → Libreria:**
   - Cerca "Places API" 
   - Clicca "ABILITA"

2. **Su Google Cloud Console → Credenziali → Tua API Key:**
   - Vai a "Restrizioni API"
   - Seleziona "Limita chiave"
   - Abilita solo "Places API"

### 🚀 Test Configuration:
```bash
node setup-google-reviews.mjs
```

---

## 📋 **COSA CHIEDERE AL BARBIERE/PROPRIETARIO**

### Informazioni Necessarie:
1. **📍 Dati dell'Attività:**
   - Nome esatto dell'attività su Google My Business
   - Indirizzo completo (deve corrispondere esattamente)
   - Numero di telefono dell'attività
   - URL del profilo Google My Business

2. **🔐 Accesso Google:**
   - Email dell'account Google che gestisce il profilo business
   - Il barbiere deve aggiungerti come "Manager" al profilo GMB
   - Accesso al Google Cloud Console (se già configurato)

3. **💳 Billing Google Cloud:**
   - Google richiede una carta di credito anche per il piano gratuito
   - Il barbiere deve essere disposto a configurare il billing
   - Costi: Prime 100.000 richieste/mese GRATIS

4. **📱 Verifica Proprietà:**
   - Il barbiere deve verificare di essere il proprietario dell'attività
   - Potrebbe essere necessaria una verifica telefonica/postale

---

## ⚙️ Passaggi Tecnici (da fare insieme al barbiere):

## ⚙️ Passaggi Tecnici (da fare insieme al barbiere):

### 1. Creare un progetto Google Cloud
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita la **Google Places API**
4. **⚠️ IMPORTANTE:** Configura il billing (richiede carta di credito)

### 2. Ottenere l'API Key
1. Vai su "Credenziali" → "Crea credenziali" → "Chiave API"
2. Copia la chiave API generata
3. **🔒 SICUREZZA:** Imposta restrizioni IP/dominio

### 3. Trovare il Place ID dell'attività
1. Vai su [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Cerca "Maskio Barber" o il nome esatto dell'attività
3. Copia il Place ID che appare (formato: `ChIJ...`)

### 4. Configurare le variabili d'ambiente
Modifica il file `.env.local` con i dati ottenuti:

```bash
# Google Places API Configuration
GOOGLE_PLACES_API_KEY=AIza...la_chiave_api_completa
GOOGLE_PLACE_ID=ChIJ...il_place_id_completo
```

### 5. Test e Verifica
```bash
npm run dev
# Verifica che le recensioni vengano caricate nella sezione testimonianze
```

---

## 📞 **DOMANDE SPECIFICHE PER IL BARBIERE:**

### Checklist di domande:
- [ ] "Hai un profilo Google My Business attivo e verificato?"
- [ ] "Qual è l'email dell'account Google che gestisce il profilo?"
- [ ] "Puoi aggiungermi come manager del profilo GMB?"
- [ ] "Hai mai configurato API Google o Google Cloud Console?"
- [ ] "Sei disposto a configurare il billing Google Cloud? (gratuito fino a 100k richieste/mese)"
- [ ] "Qual è l'indirizzo esatto dell'attività su Google Maps?"

### Se il barbiere non ha esperienza tecnica:
1. **Proponi un appuntamento** per configurare insieme
2. **Screen sharing** per guidarlo nel processo
3. **Offri di gestire tu** la parte tecnica (con il suo account)
4. **Spiegagli i benefici:** recensioni automatiche sul sito web

---

## 💡 **ALTERNATIVE SE NON VUOLE CONFIGURARE GOOGLE API:**

### Opzioni più semplici:
1. **🖼️ Screenshot delle recensioni** da Google My Business
2. **📝 Copia manuale** delle recensioni nel database
3. **🔗 Widget Google** incorporato (meno personalizzabile)
4. **📱 QR Code** che porta alle recensioni Google

### Template email per il barbiere:
```
Ciao [Nome],

Per migliorare il tuo sito web, vorrei sincronizzare le recensioni di Google 
con la pagina delle testimonianze.

Ho bisogno di:
✅ Accesso al tuo profilo Google My Business
✅ Configurare un'API Google (gratuita fino a 100k richieste/mese)
✅ 30 minuti del tuo tempo per la configurazione

Vantaggi:
🌟 Recensioni aggiornate automaticamente sul sito
📈 Maggiore credibilità per i clienti
⚡ Nessun lavoro manuale da parte tua

Possiamo farlo insieme tramite videocall se preferisci.

Fammi sapere quando hai 30 minuti liberi!

Saluti,
[Il tuo nome]
```

---

## 🚨 **ATTENZIONE - Limitazioni Google:**

- **📊 Massimo 5 recensioni** per richiesta API
- **⏰ Aggiornamento ogni 24h** (non real-time)
- **🔐 Alcune recensioni** potrebbero non essere accessibili via API
- **💰 Costi aggiuntivi** oltre le 100k richieste/mese
- **📱 Mobile vs Desktop** possono mostrare recensioni diverse

---

## Note importanti:
- ⚠️ **Attualmente vengono mostrate recensioni di esempio** perché l'API non è configurata
- 🔒 L'API Key dovrebbe essere mantenuta segreta
- 💰 Google Places API ha un piano gratuito con limiti di utilizzo
- 📝 Le recensioni vengono aggiornate automaticamente quando disponibili

## Costi Google Places API:
- Prime 100.000 richieste/mese: **GRATIS**
- Oltre: $17 per 1000 richieste aggiuntive

Per la maggior parte delle attività locali, il piano gratuito è sufficiente.
