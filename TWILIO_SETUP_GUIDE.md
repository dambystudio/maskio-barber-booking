# 📱 Guida Configurazione Twilio SMS

## Passaggio 1: Crea Account Twilio

1. Vai su **https://www.twilio.com/try-twilio**
2. Registrati con la tua email
3. Verifica numero di telefono
4. Completa il setup iniziale

## Passaggio 2: Ottieni Credenziali

1. Vai su **https://console.twilio.com/**
2. Dal Dashboard, copia:
   - **Account SID** (inizia con AC...)
   - **Auth Token** (clicca "Show" per vederlo)

## Passaggio 3: Configura Numero di Telefono (Solo per SMS classici)

⚠️ **NOTA**: Per la verifica SMS usiamo Twilio Verify Service che NON richiede un numero dedicato!

Se vuoi comunque un numero Twilio:
1. Vai su **Phone Numbers > Manage > Buy a number**
2. Scegli un numero (costo: ~$1/mese)
3. Copia il numero con formato +1XXXXXXXXXX

## Passaggio 4: Aggiorna .env.local

Apri il file `.env.local` e sostituisci:

```bash
TWILIO_ACCOUNT_SID=YOUR_REAL_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_REAL_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=+15555551234  # Opzionale per Verify Service
```

Con le tue credenziali reali:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890  # Opzionale
```

## Passaggio 5: Crea Verify Service

Esegui il comando per creare automaticamente il Verify Service:

```bash
node check-twilio-config.mjs
```

Questo comando:
- ✅ Testa la connessione Twilio
- ✅ Crea automaticamente un Verify Service
- ✅ Aggiunge TWILIO_VERIFY_SERVICE_SID al tuo .env.local

## Passaggio 6: Test

Una volta configurato, il sistema invierà SMS reali tramite Twilio Verify Service!

## 💰 Costi Twilio

- **Account gratuito**: $15.50 di credito gratuito
- **SMS Verify**: ~$0.05 per SMS
- **Numero di telefono**: ~$1/mese (NON necessario per Verify Service)

## 🔧 Risoluzione Problemi

- **Errore "Authenticate"**: Credenziali sbagliate
- **Errore "Permission denied"**: Account non verificato
- **SMS non arrivano**: Controlla numero formato +39XXXXXXXXX

## 📞 Supporto

Se hai problemi, controlla:
1. https://console.twilio.com/
2. Sezione "Logs" per errori
3. Verifica credito rimanente
