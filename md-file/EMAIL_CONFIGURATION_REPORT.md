# 📧 EMAIL CONFIGURATION - Maskio Barber

**Data aggiornamento**: ${new Date().toLocaleString('it-IT')}

---

## 📮 **DESTINAZIONI EMAIL ATTUALI**

Tutte le email del sistema vengono inviate a: **`fabio.cassano97@icloud.com`**

---

## 📋 **DETTAGLIO CONFIGURAZIONI**

### 🔧 **1. Lavora con Noi (CV/Candidature)**
**File**: `src/app/api/careers/route.ts`
- **Destinatario**: `fabio.cassano97@icloud.com`
- **Mittente**: `fabio.cassano97@icloud.com`
- **Funzionalità**: 
  - Ricevi CV in PDF (max 5MB)
  - Email automatica di conferma al candidato
  - CV allegato come attachment

### 📅 **2. Sistema Prenotazioni**
**File**: `src/lib/email.ts`
- **Email Admin**: `fabio.cassano97@icloud.com`
- **Mittente**: `Maskio Barber <fabio.cassano97@icloud.com>`
- **Funzionalità**:
  - Conferme prenotazione ai clienti
  - Promemoria automatici (1 giorno prima)
  - Notifiche admin per nuove prenotazioni

### 👤 **3. Sistema Autenticazione**
**File**: `src/lib/auth.ts`
- **Email Barbieri Autorizzati**: 
  - `fabio.cassano97@icloud.com`
  - `prova@gmail.com`
- **Funzionalità**: Auto-promozione a ruolo 'barber' per email specifiche

### 📞 **4. Contatti Diretti**
**File**: `src/app/contatti/page.tsx`
- **Email**: `fabio.cassano97@icloud.com`
- **Telefono**: `+39 331 710 0730`
- **WhatsApp**: `+39 331 710 0730`

---

## ⚙️ **SERVIZIO EMAIL UTILIZZATO**

### **Resend.com**
- **Provider**: Resend Email Service
- **Piano**: Gratuito (3.000 email/mese)
- **API Key**: Configurata in `RESEND_API_KEY`
- **Dominio verificato**: icloud.com

---

## 📁 **FILE CONFIGURAZIONE**

### **Variabili d'ambiente** (`.env.local`)
```bash
RESEND_API_KEY=your-resend-api-key
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **Configurazione esempio** (`.env.example`)
```bash
ADMIN_EMAIL=admin@yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
ENABLE_EMAIL_NOTIFICATIONS=true
```

---

## 🎯 **FLUSSI EMAIL ATTIVI**

### **📝 Candidature Lavoro**
1. Utente invia CV tramite form "Lavora con Noi"
2. Email inviata a `fabio.cassano97@icloud.com` con CV allegato
3. Email di conferma inviata al candidato

### **📅 Prenotazioni**
1. Cliente effettua prenotazione
2. Email di conferma inviata al cliente
3. Notifica admin inviata a `fabio.cassano97@icloud.com`
4. Promemoria automatico 24h prima (se configurato)

### **👥 Registrazione Barbieri**
1. Barbiere si registra con email `fabio.cassano97@icloud.com` o `prova@gmail.com`
2. Ruolo automaticamente impostato come 'barber'
3. Accesso immediato al pannello prenotazioni

---

## 🔧 **COME MODIFICARE LE EMAIL**

### **Per cambiare l'email di destinazione**:

1. **Candidature/CV**: Modifica `src/app/api/careers/route.ts` linea 46
2. **Admin prenotazioni**: Modifica `src/lib/email.ts` linea 22
3. **Email mittente**: Modifica `src/lib/email.ts` linea 21
4. **Barbieri autorizzati**: Modifica `src/lib/auth.ts` linee 68 e 155

### **Esempio modifica**:
```typescript
// Da:
private static ADMIN_EMAIL = 'fabio.cassano97@icloud.com';

// A:
private static ADMIN_EMAIL = 'nuova-email@esempio.com';
```

---

## ⚠️ **NOTE IMPORTANTI**

- **Verifica dominio**: Per usare un dominio personalizzato, deve essere verificato su Resend
- **Limite gratuito**: 3.000 email/mese con Resend gratuito
- **Formato CV**: Solo PDF accettati, massimo 5MB
- **Backup email**: Mantieni sempre `fabio.cassano97@icloud.com` come fallback

---

## 🚀 **EMAIL TEMPLATE DISPONIBILI**

- `BookingConfirmationEmail` - Conferma prenotazione cliente
- `BookingReminderEmail` - Promemoria appuntamento
- `AdminNotificationEmail` - Notifica admin nuova prenotazione
- Email CV/Candidature (HTML inline)

**Tutte le email sono responsive e ottimizzate per mobile/desktop.**
