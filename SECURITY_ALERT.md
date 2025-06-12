# 🚨 ATTENZIONE: FILE CONTENENTE CREDENZIALI 🚨

Questo progetto contiene credenziali sensibili hardcoded in vari file di script (.js/.mjs).

## Problemi identificati:

1. Credenziali del database esposte nei file di script:
   - Connessione diretta al database Neon in molti script .mjs e .js
   - Formato: `DATABASE_URL=postgres://neondb_owner:password@host/neondb`
   - File interessati: ~25 file di script di utility e test

2. Chiavi API Google esposte in file markdown:
   - VERCEL_ENV_VARS.md
   - GOOGLE_REVIEWS_SETUP.md
   - VERCEL_ENVIRONMENT_VARIABLES_REQUIRED.md

## Azioni URGENTI da intraprendere:

1. **Modificare immediatamente le password e i secret**:
   - Cambiare la password del database Neon
   - Rigenerare il NEXTAUTH_SECRET
   - Rigenerare o applicare restrizioni alle API key di Google

2. **Rimuovere le credenziali dal repository git**:
   ```
   git rm --cached VERCEL_ENV_VARS.md GOOGLE_REVIEWS_SETUP.md VERCEL_ENVIRONMENT_VARIABLES_REQUIRED.md
   echo "VERCEL_ENV_VARS.md" >> .gitignore
   echo "GOOGLE_REVIEWS_SETUP.md" >> .gitignore
   echo "VERCEL_ENVIRONMENT_VARIABLES_REQUIRED.md" >> .gitignore
   echo "*.env*" >> .gitignore
   git commit -m "Rimozione di file con credenziali sensibili dal repository"
   ```

3. **Refactoring degli script**:
   - Creare un file `.env` per gli script (non committato)
   - Usare `dotenv` per caricare le variabili d'ambiente negli script
   - Modificare tutti gli script per leggere le credenziali da process.env senza fallback hardcoded
   - Esempio: `const { DATABASE_URL } = process.env;` (senza fallback)

4. **Aggiornare la documentazione**:
   - Creare un file `script.env.example` (già fatto)
   - Aggiornare le guide con placeholder invece di credenziali reali
   - Rimuovere TUTTI i riferimenti a credenziali reali

## Implicazioni di sicurezza:

Le credenziali attualmente presenti nel repository possono essere state esposte pubblicamente se:
1. Il repository è stato condiviso pubblicamente su GitHub o altri servizi
2. Il repository è stato clonato da collaboratori esterni

È essenziale modificare TUTTE le credenziali il prima possibile.
