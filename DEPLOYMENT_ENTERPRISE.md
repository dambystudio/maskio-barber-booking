# 🚀 GUIDA DEPLOYMENT ENTERPRISE GRATUITO

## Panoramica Upgrade
Il sistema Maskio Barber è stato aggiornato da JSON file storage a un'architettura enterprise professionale usando servizi gratuiti Vercel:

### 🆕 Novità Implementate
- ✅ **Database Vercel KV** (Redis gratuito - 30.000 operazioni/mese)
- ✅ **Sistema di Autenticazione** (NextAuth.js con Google OAuth)
- ✅ **Email Professionali** (Resend - 3.000 email/mese gratuite)
- ✅ **Dashboard Admin** con statistiche avanzate
- ✅ **Rate Limiting** e sicurezza enterprise
- ✅ **Template email professionali** per conferme e promemoria

---

## 📋 CHECKLIST DEPLOYMENT

### 1. Configurazione Database Vercel KV (GRATUITO)

1. **Accedi a Vercel Dashboard**
   - Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
   - Seleziona il tuo progetto Maskio Barber

2. **Crea Database KV**
   - Clicca "Storage" nella barra laterale
   - Clicca "+ Create Database"
   - Seleziona "KV" (Redis)
   - Nome: `maskio-barber-db`
   - Region: Europe (Amsterdam) - più vicina all'Italia

3. **Ottieni Credenziali**
   - Dopo la creazione, vai su "Settings" del database
   - Copia le seguenti variabili:
     ```
     KV_URL
     KV_REST_API_URL
     KV_REST_API_TOKEN
     KV_REST_API_READ_ONLY_TOKEN
     ```

### 2. Configurazione Email Resend (GRATUITO)

1. **Registrati su Resend**
   - Vai su [resend.com](https://resend.com)
   - Registrati con lo stesso email del dominio

2. **Crea API Key**
   - Dashboard → API Keys → "+ Create API Key"
   - Nome: `maskio-barber-emails`
   - Permessi: "Sending access"
   - Copia la `RESEND_API_KEY`

3. **Verifica Dominio (Opzionale)**
   - Se hai un dominio: Dashboard → Domains → Add Domain
   - Altrimenti usa `onboarding@resend.dev` per test

### 3. Configurazione OAuth Google (OPZIONALE)

1. **Google Cloud Console**
   - Vai su [console.developers.google.com](https://console.developers.google.com)
   - Crea nuovo progetto o seleziona esistente

2. **Configura OAuth**
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (sviluppo)
     - `https://tuodominio.com/api/auth/callback/google` (produzione)

3. **Ottieni Credenziali**
   - Copia `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

### 4. Configurazione Variabili d'Ambiente

1. **Crea .env.local**
   ```bash
   cp .env.example .env.local
   ```

2. **Compila le variabili**
   ```env
   # Database Vercel KV
   KV_URL=redis://...
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...

   # NextAuth
   NEXTAUTH_SECRET=genera-stringa-casuale-32-caratteri
   NEXTAUTH_URL=https://tuodominio.com

   # Google OAuth (opzionale)
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...

   # Email Resend
   RESEND_API_KEY=re_...
   EMAIL_FROM=noreply@tuodominio.com

   # Admin
   ADMIN_EMAIL=admin@tuodominio.com
   ```

### 5. Migrazione Dati

1. **Installa dipendenze**
   ```bash
   npm install
   ```

2. **Esegui migrazione**
   ```bash
   node scripts/migrate-data.mjs
   ```

3. **Verifica migrazione**
   - Il script mostrerà un report dettagliato
   - Verifica che tutte le prenotazioni siano migrate

### 6. Deploy su Vercel

1. **Configura variabili su Vercel**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Aggiungi tutte le variabili da .env.local

2. **Deploy**
   ```bash
   git add .
   git commit -m "Enterprise upgrade: DB + Auth + Email"
   git push
   ```

3. **Verifica deployment**
   - Vai su https://tuodominio.com
   - Testa prenotazioni
   - Verifica email di conferma
   - Testa dashboard admin: https://tuodominio.com/admin

---

## 🧪 TESTING POST-DEPLOY

### Test Funzionalità Base
- [ ] Homepage carica correttamente
- [ ] Form prenotazioni funziona
- [ ] Slot orari si caricano correttamente
- [ ] Prenotazione crea entry nel database

### Test Email
- [ ] Email conferma prenotazione arriva
- [ ] Email ha design professionale
- [ ] Link nel footer funzionano

### Test Autenticazione
- [ ] Pagina signin/signup accessibile
- [ ] Login con Google funziona (se configurato)
- [ ] Dashboard admin accessibile dopo login

### Test Database
- [ ] Prenotazioni salvate in Vercel KV
- [ ] Statistiche dashboard mostrano dati corretti
- [ ] API rate limiting funziona

---

## 🔧 TROUBLESHOOTING

### Errori Comuni

**❌ "KV_URL is not defined"**
- Verifica variabili d'ambiente Vercel KV
- Riavvia il dev server dopo aver aggiunto variabili

**❌ "Failed to send email"**
- Verifica RESEND_API_KEY
- Controlla che EMAIL_FROM sia verificato

**❌ "NextAuth configuration error"**
- Genera nuovo NEXTAUTH_SECRET
- Verifica NEXTAUTH_URL sia corretto

**❌ "Migration failed"**
- Verifica connessione database KV
- Controlla che data/bookings.json esista

### Performance
- ✅ Database KV: ~1ms response time
- ✅ Email delivery: ~2-3 secondi
- ✅ Rate limiting: 10 req/min per IP

---

## 📊 MONITORAGGIO

### Vercel Dashboard
- Database KV usage: /storage
- Function logs: /functions
- Analytics: /analytics

### Resend Dashboard
- Email stats: resend.com/dashboard
- Delivery rates e bounces

### NextAuth Sessions
- User sessions automatiche
- Google OAuth metrics

---

## 🎯 PROSSIMI PASSI

1. **Setup DNS** per dominio personalizzato
2. **Configurazione backup** database (Vercel include backup automatici)
3. **Monitoring alerting** per rate limits
4. **Custom domain** per email (opzionale)
5. **Analytics avanzate** con Vercel Analytics

---

## 💰 COSTI (TUTTI GRATUITI)

- **Vercel KV**: 30.000 operazioni/mese gratuito
- **Resend**: 3.000 email/mese gratuito  
- **NextAuth**: Gratuito
- **Google OAuth**: Gratuito
- **Vercel Hosting**: 100GB/mese gratuito

**💡 Totale costo mensile: €0**

---

## 🆘 SUPPORTO

Per problemi o domande:
1. Controlla logs Vercel Dashboard
2. Verifica variabili d'ambiente
3. Testa in locale prima del deploy
4. Usa script di migrazione per debug

**🎉 Congratulazioni! Hai aggiornato Maskio Barber a un sistema enterprise professionale completamente gratuito!**
