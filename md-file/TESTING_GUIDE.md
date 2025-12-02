# 🧪 TESTING GUIDE - Maskio Barber Enterprise Features

## 🎯 PRE-DEPLOYMENT TESTING CHECKLIST

Questi test vanno eseguiti in locale prima del deployment su Vercel per verificare che tutte le funzionalità enterprise funzionino correttamente.

---

## 🏠 **1. Homepage & Navigation**

✅ **Test URL**: http://localhost:3000

**Cosa verificare:**
- [ ] Homepage carica correttamente
- [ ] Menu navigation responsive
- [ ] Link "Admin" visibile nel menu (desktop e mobile)
- [ ] Tutti i link interni funzionano
- [ ] Design responsive su mobile

---

## 🔐 **2. Sistema Autenticazione**

### **Sign In Page**
✅ **Test URL**: http://localhost:3000/auth/signin

**Cosa verificare:**
- [ ] Form login carica correttamente
- [ ] Button "Sign in with Google" presente
- [ ] Form email/password funziona (anche senza credenziali configurate)
- [ ] Design professionale e responsive

### **Sign Up Page**  
✅ **Test URL**: http://localhost:3000/auth/signup

**Cosa verificare:**
- [ ] Form registrazione completo
- [ ] Validazione campi email/password
- [ ] Interfaccia utente pulita

---

## 📅 **3. Sistema Prenotazioni**

### **Booking Page**
✅ **Test URL**: http://localhost:3000/prenota

**Cosa verificare:**
- [ ] Form prenotazione carica
- [ ] Selezione servizi disponibile
- [ ] Selezione barber funziona
- [ ] Calendar date picker attivo
- [ ] Time slots visibili

### **API Booking Creation**
**Test manuale**: Prova a creare una prenotazione

**Cosa verificare:**
- [ ] Validazione dati funziona
- [ ] Response JSON corretta
- [ ] Error handling appropriato

### **Bookings List**
✅ **Test URL**: http://localhost:3000/prenotazioni

**Cosa verificare:**
- [ ] Lista prenotazioni carica (anche se vuota)
- [ ] Design tabella responsive

---

## 👑 **4. Admin Dashboard**

### **Admin Page**
✅ **Test URL**: http://localhost:3000/admin

**Cosa verificare:**
- [ ] Redirect a signin se non autenticato
- [ ] Dashboard UI carica correttamente
- [ ] Cards statistiche presenti (anche con dati vuoti)
- [ ] Tabella prenotazioni recenti
- [ ] Design professionale

### **Admin API**
✅ **Test URL**: http://localhost:3000/api/admin/stats

**Cosa verificare:**
- [ ] API risponde con JSON
- [ ] Struttura dati corretta:
```json
{
  "todayBookings": 0,
  "weekBookings": 0, 
  "monthBookings": 0,
  "totalRevenue": 0
}
```

---

## 🚀 **5. API Endpoints Testing**

### **Bookings API**
```bash
# GET bookings
curl http://localhost:3000/api/bookings

# Expected: JSON array (anche vuoto)
```

### **Booking Slots API**
```bash  
# GET available slots
curl "http://localhost:3000/api/bookings/slots?date=2025-05-26&barberId=1"

# Expected: JSON array di time slots
```

### **Registration API**
```bash
# POST user registration  
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Expected: Success o error JSON
```

---

## 📱 **6. Mobile Responsiveness**

**Device Testing:**
- [ ] Chrome DevTools mobile view
- [ ] Tablet landscape/portrait
- [ ] Mobile phone sizes
- [ ] Touch interactions

**Zoom Bug Fix Verification:**
- [ ] Zoom in/out su mobile non causa redirect
- [ ] Nessun loop infinito
- [ ] Security overlay non interferisce

---

## 🔒 **7. Security Features**

### **Rate Limiting**
**Test**: Effettua multiple richieste rapide alle API

**Cosa verificare:**
- [ ] Dopo troppe richieste, API risponde con 429
- [ ] Rate limiting non blocca uso normale

### **Input Validation**
**Test**: Invia dati invalidi alle API

**Cosa verificare:**
- [ ] Email invalide vengono rifiutate
- [ ] Date future richieste
- [ ] SQL injection protection

---

## 📧 **8. Email System (In Development Mode)**

**Note**: Le email non vengono inviate in dev senza RESEND_API_KEY, ma il sistema deve gestirlo correttamente.

**Cosa verificare:**
- [ ] Booking creation non crasha per email fallite
- [ ] Console logs mostrano "Email sending failed" (normale)
- [ ] Sistema continua a funzionare

---

## 🛠️ **9. Error Handling**

### **404 Pages**
✅ **Test URL**: http://localhost:3000/pagina-inesistente

**Cosa verificare:**
- [ ] 404 page custom carica
- [ ] Design consistente con il sito

### **API Error Responses**
**Test**: Chiamate API con dati invalidi

**Cosa verificare:**
- [ ] Errori JSON ben formattati
- [ ] Status codes appropriati (400, 500, etc.)
- [ ] Messaggi errore informativi

---

## ✅ **TEST RESULTS TEMPLATE**

```
🧪 TESTING COMPLETED - [DATA]

✅ PASSED:
- [ ] Homepage & Navigation
- [ ] Authentication System  
- [ ] Booking System
- [ ] Admin Dashboard
- [ ] API Endpoints
- [ ] Mobile Responsiveness
- [ ] Security Features
- [ ] Email System
- [ ] Error Handling

❌ ISSUES FOUND:
- [Lista problemi trovati]

🚀 READY FOR DEPLOYMENT: [SI/NO]
```

---

## 🎉 **DEPLOYMENT READINESS CRITERIA**

Il sistema è pronto per deployment quando:

✅ **All Core Features Working**
- Login/Registration forms functional
- Booking system operational  
- Admin dashboard accessible
- API endpoints responding

✅ **No Critical Errors**
- No 500 server errors
- No infinite loops or crashes
- Graceful error handling

✅ **Mobile Compatible**
- Responsive design working
- No zoom bugs
- Touch interactions smooth

✅ **Security Validated**
- Rate limiting active
- Input validation working
- Authentication protecting admin routes

---

Una volta completati tutti i test con successo, il sistema sarà pronto per il deployment su Vercel con le credenziali di produzione! 🚀
