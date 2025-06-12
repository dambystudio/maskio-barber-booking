# 🔐 Configurazione Google OAuth per Maskio Barber

## 📋 Guida Completa alla Configurazione

### 1. 🏗️ Accesso al Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Accedi con il tuo account Google
3. Seleziona il progetto esistente **"maskio-barber-reviews-api"** o crea un nuovo progetto

### 2. 🔧 Abilitazione delle API necessarie

1. Nel menu laterale, vai su **"API e servizi" > "Libreria"**
2. Cerca e abilita le seguenti API:
   - **Google+ API** (se disponibile)
   - **Google Identity Services API**
   - **People API** (opzionale, per informazioni aggiuntive del profilo)

### 3. 🆔 Creazione delle Credenziali OAuth 2.0

1. Nel menu laterale, vai su **"API e servizi" > "Credenziali"**
2. Clicca su **"+ CREA CREDENZIALI"**
3. Seleziona **"ID client OAuth"**
4. Scegli **"Applicazione web"** come tipo di applicazione
5. Configura le impostazioni:

#### 📝 Configurazione ID Client OAuth:
- **Nome**: `Maskio Barber - Web App`
- **URI di reindirizzamento autorizzati**:
  - `http://localhost:3000/api/auth/callback/google` (sviluppo)
  - `https://tuodominio.com/api/auth/callback/google` (produzione)

### 4. 🔑 Ottenere le Credenziali

Dopo aver creato le credenziali, otterrai:
- **Client ID**: Una stringa lunga che inizia con numeri
- **Client Secret**: Una stringa segreta

### 5. ⚙️ Configurazione nel file .env.local

Sostituisci i valori nel file `.env.local`:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=il-tuo-client-id-qui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=il-tuo-client-secret-qui
```

### 6. 🎨 Configurazione Schermata di Consenso OAuth

1. Nel menu laterale, vai su **"API e servizi" > "Schermata consenso OAuth"**
2. Scegli **"Esterno"** (per utenti esterni all'organizzazione)
3. Compila le informazioni obbligatorie:

#### 📋 Informazioni App:
- **Nome app**: `Maskio Barber`
- **Email di supporto utenti**: `la-tua-email@gmail.com`
- **Logo dell'app**: Carica il logo di Maskio Barber
- **Domini dell'app**: `localhost` (sviluppo), `tuodominio.com` (produzione)
- **Email sviluppatore**: `la-tua-email@gmail.com`

#### 🔍 Ambiti (Scopes):
Aggiungi i seguenti ambiti:
- `email` - Per ottenere l'indirizzo email
- `profile` - Per ottenere nome e immagine del profilo
- `openid` - Per l'identificazione OpenID

### 7. 👥 Aggiungere Utenti di Test (Fase Sviluppo)

Durante lo sviluppo, aggiungi email di test:
1. Vai su **"Schermata consenso OAuth"**
2. Scorri fino a **"Utenti di test"**
3. Aggiungi le email che potranno testare il login Google

### 8. 🚀 Pubblicazione dell'App (Produzione)

Per rendere l'app disponibile a tutti:
1. Completa tutte le sezioni della schermata di consenso
2. Invia l'app per la verifica di Google
3. Una volta approvata, cambia lo stato da **"Test"** a **"Pubblicata"**

## 🔧 Test di Funzionamento

### Sviluppo (localhost:3000):
1. Vai su `http://localhost:3000/auth/signin`
2. Clicca su **"Continua con Google"**
3. Dovrebbe aprirsi il popup di autenticazione Google
4. Dopo l'autorizzazione, dovresti essere reindirizzato all'area personale

### ✅ Verifica della Configurazione:
- [ ] Google Cloud Project creato/selezionato
- [ ] API Google+ abilitata
- [ ] Credenziali OAuth 2.0 create
- [ ] URI di reindirizzamento configurati
- [ ] Client ID e Secret aggiunti a .env.local
- [ ] Schermata di consenso configurata
- [ ] Utenti di test aggiunti (se in fase di sviluppo)

## 🎯 Risultato Atteso

Dopo la configurazione corretta:
1. **Login esistente**: Gli utenti potranno accedere con email/password come prima
2. **Login Google**: Nuovo pulsante per accedere con account Google
3. **Registrazione automatica**: Gli utenti Google verranno creati automaticamente nel database
4. **Email verificata**: Gli account Google avranno automaticamente l'email verificata
5. **Sincronizzazione profilo**: Nome e immagine verranno sincronizzati da Google

## 🔒 Sicurezza

- ✅ Le credenziali sono memorizzate solo in `.env.local`
- ✅ Gli utenti Google vengono creati con email già verificata
- ✅ Il processo rispetta gli standard OAuth 2.0
- ✅ NextAuth gestisce automaticamente i token e la sicurezza

---

## 📞 Supporto

Se hai problemi con la configurazione:
1. Verifica che tutti gli URI di reindirizzamento siano corretti
2. Controlla che le API siano abilitate nel Google Cloud Console
3. Assicurati che il progetto Google sia nello stato corretto (Test/Produzione)
4. Verifica che i domini siano configurati correttamente nella schermata di consenso
