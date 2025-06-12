# Variabili d'ambiente necessarie per il deployment su Vercel

Questo documento raccoglie tutte le variabili d'ambiente e le chiavi sensibili utilizzate nel tuo progetto Maskio Barber Booking. Utilizza questo file come guida per configurare le variabili d'ambiente su Vercel.

## Configurazione delle variabili su Vercel
1. Accedi al tuo account Vercel
2. Vai su Dashboard → Il tuo progetto → Settings → Environment Variables
3. Aggiungi ogni variabile elencata qui sotto

## Variabili d'ambiente necessarie

### Database
```
DATABASE_URL=<DATABASE_CONNECTION_STRING>
```
- Fonte trovata in: `src/lib/database-postgres.ts`, vari script di test/manutenzione
- Descrizione: Connessione al database PostgreSQL su Neon
- ⚠️ **ATTENZIONE**: Assicurati di utilizzare la stringa di connessione corretta in produzione

### NextAuth
```
NEXTAUTH_SECRET=<GENERA_UN_SECRET_SICURO>
NEXTAUTH_URL=<URL_DEL_TUO_SITO_VERCEL>
```
- Fonte trovata in: `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth.ts`
- Descrizione: Chiavi per la configurazione di NextAuth
- ⚠️ **ATTENZIONE**: In produzione, cambia `NEXTAUTH_SECRET` con una stringa casuale e sicura e imposta l'URL corretto del tuo dominio

### Google OAuth
```
GOOGLE_CLIENT_ID=<IL_TUO_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<IL_TUO_GOOGLE_CLIENT_SECRET>
```
- Fonte trovata in: `src/app/api/auth/[...nextauth]/route.ts`
- Descrizione: Credenziali per l'autenticazione OAuth con Google
- ⚠️ **ATTENZIONE**: Assicurati che le URI di reindirizzamento nella console Google Cloud siano configurate correttamente per il tuo dominio di produzione

### Email (Resend o altro provider)
```
RESEND_API_KEY=re_123456789
```
- Fonte trovata in: `src/lib/email.ts`
- Descrizione: Chiave API per il servizio di email Resend
- Nota: Nel codice c'è un placeholder (`placeholder-key-for-build`) che viene utilizzato durante il build se la chiave non è disponibile

### Google Places API (per le recensioni)
```
GOOGLE_PLACES_API_KEY=<IL_TUO_GOOGLE_PLACES_API_KEY>
GOOGLE_PLACE_ID=<IL_TUO_GOOGLE_PLACE_ID>
```
- Fonte trovata in: `src/app/api/google-reviews/route.ts`, script di test per le recensioni
- Descrizione: Chiave API per accedere alle recensioni Google del barbiere

## Note aggiuntive

1. **Sicurezza**: Tutte queste variabili d'ambiente sono sensibili. Non condividerle pubblicamente o includerle nel codice sorgente versione.

2. **Ambienti di sviluppo/produzione**: Alcune parti del codice si comportano diversamente in base all'ambiente (`process.env.NODE_ENV`). Vercel imposta automaticamente questa variabile in `production`.

3. **Variabili opzionali**:
   - `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`: Sembrano essere variabili alternative per la configurazione email, ma non sono attivamente utilizzate nel codice principale.
   
4. **Verifica email**: Il sistema di verifica email attualmente utilizza uno storage in-memory che non funzionerà correttamente in un ambiente serverless come Vercel. Considera di implementare una soluzione più robusta con un database o Redis prima del deployment finale.

5. **Per applicare le variabili d'ambiente**: Dopo averle configurate su Vercel, redeploy l'applicazione per assicurarti che le nuove variabili vengano utilizzate.
