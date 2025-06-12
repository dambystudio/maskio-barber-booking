# CONFIGURAZIONE GOOGLE OAUTH PER PRODUZIONE

## Passi da seguire:

### 1. Aggiorna Google Cloud Console
1. Vai su https://console.developers.google.com
2. Seleziona il tuo progetto
3. Vai su "Credentials" → OAuth 2.0 Client IDs
4. Clicca sul tuo Client ID esistente
5. Aggiungi negli "Authorized JavaScript origins":
   - https://maskio-barber-booking.vercel.app
6. Aggiungi negli "Authorized redirect URIs":
   - https://maskio-barber-booking.vercel.app/api/auth/callback/google

### 2. Verifica Database Connectivity
Il database Neon è già configurato per accettare connessioni esterne.
✅ Nessuna modifica necessaria

### 3. Test dopo il deploy
1. Login con Google
2. Login con credenziali
3. Prenotazioni
4. Pannello admin
5. Profilo utente

## STATO ATTUALE: ✅ PRONTO PER IL DEPLOY
