# Guida alla Sicurezza per lo Sviluppo Locale

## Installazione e configurazione delle variabili d'ambiente

1. **Crea un file `.env` nella root del progetto**:
   ```
   cp script.env.example .env
   ```

2. **Compila il file `.env` con le tue credenziali**:
   ```
   # Database
   DATABASE_URL=postgres://username:password@host/database
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   
   # Altre variabili...
   ```

3. **Verifica che il file `.env` sia nel `.gitignore`**:
   ```
   cat .gitignore | grep .env
   ```

## Utilizzo corretto delle variabili d'ambiente negli script

### Per nuovi script:

```javascript
// Importa dotenv all'inizio del file
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente 
dotenv.config();

// Usa le variabili d'ambiente senza hardcoding
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('❌ Errore: variabile d\'ambiente DATABASE_URL non trovata.');
  process.exit(1);
}

// Resto del codice...
```

### Utilizzo sicuro:
- Verifica sempre che la variabile esista prima di usarla
- Non utilizzare mai fallback hardcoded con credenziali
- Per script di test/demo, usa valori fittizi nei fallback, mai credenziali reali

## Template di riferimento

Per i nuovi script, usa il template in `database-script-template.mjs`:

```
node database-script-template.mjs
```

## Sicurezza in produzione

Per l'ambiente di produzione su Vercel:
1. Configura le variabili d'ambiente in Vercel dashboard
2. Non committare mai file `.env` o `.env.local` 
3. Usa `script.env.example` come template per documentare le variabili necessarie

## Test dello script modificato

```
node check-existing-users.mjs
```

Se funziona, hai configurato correttamente il sistema di variabili d'ambiente!
