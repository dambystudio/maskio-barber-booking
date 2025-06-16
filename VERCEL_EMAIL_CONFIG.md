# 📧 CONFIGURAZIONE EMAIL PER VERCEL

## 🚨 **VARIABILI OBBLIGATORIE PER LE EMAIL**

### **1. RESEND API KEY (OBBLIGATORIO)**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

**Come ottenerlo:**
1. Vai su [resend.com](https://resend.com)
2. Registrati/Accedi
3. Vai in "API Keys"
4. Crea una nuova API key
5. Copia il valore che inizia con `re_`

---

## 📋 **VARIABILI EMAIL DA AGGIUNGERE SU VERCEL:**

### **📧 Email System (Tutte obbligatorie)**
```bash
# Resend Service (per CV e notifiche)
RESEND_API_KEY=re_your_actual_api_key_here

# Email fallback (se Resend non funziona)
EMAIL_SERVICE=gmail
EMAIL_USER=fabio.cassano97@icloud.com
EMAIL_PASS=your_app_specific_password
```

### **👑 Ruoli Autorizzati (Nuove - Obbligatorie)**
```bash
# Email degli admin (separati da virgola)
ADMIN_EMAILS=fabio.cassano97@icloud.com

# Email dei barbieri (separati da virgola) 
BARBER_EMAILS=fabio.cassano97@icloud.com,prova@gmail.com
```

---

## 🔧 **COME AGGIUNGERLE SU VERCEL:**

### **Metodo 1: Dashboard Vercel**
1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clicca sul tuo progetto "maskio-barber"
3. Vai in **Settings** > **Environment Variables**
4. Clicca **Add New**
5. Aggiungi una per una le variabili sopra

### **Metodo 2: Vercel CLI**
```bash
# Da terminale nel progetto:
vercel env add RESEND_API_KEY
vercel env add ADMIN_EMAILS  
vercel env add BARBER_EMAILS
vercel env add EMAIL_SERVICE
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

---

## ⚠️ **IMPORTANTE - PRIORITÀ:**

### **🔴 ALTA PRIORITÀ (Necessarie subito):**
1. `RESEND_API_KEY` - **Senza questa le email non funzionano**
2. `ADMIN_EMAILS` - **Senza questa non puoi essere admin**
3. `BARBER_EMAILS` - **Senza questa non puoi accedere al pannello**

### **🟡 MEDIA PRIORITÀ (Opzionali per ora):**
4. `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS` - Backup email system

---

## 🎯 **DOPO AVER AGGIUNTO LE VARIABILI:**

1. **Redeploy il progetto** su Vercel (automatico o manuale)
2. **Registrati** sul sito con `fabio.cassano97@icloud.com`
3. **Verifica** che ricevi il ruolo admin/barber automaticamente
4. **Testa** l'invio di email (CV, prenotazioni)

---

## 🧪 **TEST EMAIL SYSTEM:**

### **Test Resend API:**
```bash
# Nel browser, vai a:
https://tuo-sito.vercel.app/api/test

# Dovrebbe rispondere con status 200
```

### **Test CV Email:**
1. Vai su `/lavora-con-noi`
2. Invia un CV di test
3. Controlla se arriva email a `fabio.cassano97@icloud.com`

---

## 🔑 **VALORI DI ESEMPIO:**

```bash
# ✅ CORRETTI
RESEND_API_KEY=re_AbCdEfGh123456789
ADMIN_EMAILS=fabio.cassano97@icloud.com
BARBER_EMAILS=fabio.cassano97@icloud.com,altro@esempio.com

# ❌ SBAGLIATI  
RESEND_API_KEY=your_api_key_here    # Valore placeholder
ADMIN_EMAILS=                       # Vuoto
BARBER_EMAILS=email senza virgole   # Formato errato
```

**✨ Inizia con RESEND_API_KEY, ADMIN_EMAILS e BARBER_EMAILS - sono le più importanti!**
