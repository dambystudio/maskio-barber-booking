# 📋 Guida Step-by-Step Vercel Deploy

## 🚀 PASSO 1: Deploy su Vercel

1. **Vai su** [vercel.com](https://vercel.com)
2. **Fai login** (con GitHub, GitLab, o email)
3. **Clicca "New Project"**
4. **Importa Repository**:
   - Se il codice è su GitHub/GitLab: seleziona il repo
   - Se è locale: puoi fare upload del folder o collegare a Git

## 🔑 PASSO 2: Configurare Environment Variables

**Durante l'import o dopo il deploy:**

1. **Nella pagina del progetto Vercel**
2. **Vai a "Settings" → "Environment Variables"**
3. **Aggiungi una per una queste variabili:**

### Environment Variables da Copiare:

```
DATABASE_URL
YOUR_NEON_DATABASE_URL_HERE

NEXTAUTH_SECRET
YOUR_GENERATED_SECRET_HERE

NEXTAUTH_URL
https://NOME-PROGETTO.vercel.app

GOOGLE_CLIENT_ID
YOUR_GOOGLE_CLIENT_ID_HERE

GOOGLE_CLIENT_SECRET
YOUR_GOOGLE_CLIENT_SECRET_HERE

GOOGLE_PLACES_API_KEY
YOUR_GOOGLE_PLACES_API_KEY_HERE

GOOGLE_PLACE_ID
YOUR_GOOGLE_PLACE_ID_HERE
```

**⚠️ IMPORTANTE**: Sostituisci `NOME-PROGETTO` con il nome effettivo che Vercel assegna al tuo progetto!

## 📊 PASSO 3: Il Database NON va Aggiornato!

**BUONA NOTIZIA**: Il database Neon che stai usando:
- ✅ È già in produzione
- ✅ Ha tutti i dati (barbers, services, users)
- ✅ È configurato per SSL
- ✅ Funziona sia in locale che in produzione

**Non devi fare nulla al database!** Usa la stessa `DATABASE_URL`.

## 🔄 PASSO 4: Dopo il Deploy

1. **Vercel ti darà un URL** tipo: `https://maskio-barber-abc123.vercel.app`
2. **Aggiorna Google OAuth**:
   - Vai su Google Cloud Console
   - Aggiungi il nuovo URL agli "Authorized origins"
   - Aggiungi `https://tuo-url.vercel.app/api/auth/callback/google` ai "Redirect URIs"
3. **Aggiorna NEXTAUTH_URL** nelle environment variables con l'URL reale

## 📱 PASSO 5: Test Post-Deploy

1. **Visita il sito**
2. **Prova a registrarti/accedere**
3. **Testa una prenotazione**
4. **Verifica Google OAuth**

## 🆘 Se Qualcosa Non Funziona

**Controlla i Logs:**
1. Nella dashboard Vercel
2. Vai a "Functions" → "View Logs"
3. Cerca errori nelle API routes

**Problemi Comuni:**
- `NEXTAUTH_URL` non aggiornato
- Google OAuth non configurato per il nuovo dominio
- Environment variables mancanti o sbagliate
