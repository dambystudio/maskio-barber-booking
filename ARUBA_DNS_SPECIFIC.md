# 🚨 Configurazione DNS Specifica per Aruba

## Record DNS da Configurare (Valori Aggiornati da Vercel)

### 1️⃣ **Record A (Dominio Principale)**
```
Tipo: A
Nome: @ (o lascia vuoto)
Valore: 216.198.79.193
TTL: 3600 (o Auto)
```

### 2️⃣ **Record CNAME (Sottomdominio WWW)**
```
Tipo: CNAME
Nome: www
Valore: 352c99071fd5a50d.vercel-dns-017.com
TTL: 3600 (o Auto)
```

---

## 🔧 **Procedura su Aruba**

### **Opzione 1: DNS Avanzato (Raccomandato)**
```
1. Login: https://admin.aruba.it
2. Domini → maskiobarberconcept.it
3. "Gestione DNS" → "DNS Avanzato"
4. Elimina record esistenti se presenti
5. Aggiungi i nuovi record:

Record A:
- Tipo: A
- Nome: @ (o root)
- Destinazione: 216.198.79.193
- Clicca "Salva"

Record CNAME:
- Tipo: CNAME
- Nome: www
- Destinazione: 352c99071fd5a50d.vercel-dns-017.com
- Clicca "Salva"
```

### **Opzione 2: Nameserver Vercel (Più Semplice)**
```
Se hai problemi con DNS manuale:

1. Aruba Panel → Domini → maskiobarberconcept.it
2. "Gestione DNS" → "Nameserver"
3. Cambia a Personalizzati:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com
4. Salva

Questo farà gestire tutto a Vercel automaticamente
```

---

## ⚠️ **Possibili Problemi Aruba**

### **DNS non si aggiorna**
```
- Cache DNS Aruba: 2-6 ore
- Prova a svuotare/eliminare record vecchi
- Alcuni piani base non supportano DNS personalizzato
```

### **Record non accettati**
```
- Verifica di avere "DNS Avanzato" attivo
- Alcuni hosting Aruba bloccano record A esterni
- Prova con Nameserver Vercel invece
```

### **Formato nome errato**
```
Su Aruba potrebbe servire:
- @ invece di vuoto per root
- Oppure maskiobarberconcept.it invece di @
- Dipende dall'interfaccia Aruba
```

---

## 🔍 **Verifica Configurazione**

### **Test DNS (Windows PowerShell):**
```powershell
# Test record A
nslookup maskiobarberconcept.it

# Test record CNAME  
nslookup www.maskiobarberconcept.it

# Dovrebbero rispondere con IP Vercel
```

### **Online DNS Checker:**
```
https://www.whatsmydns.net/
Dominio: maskiobarberconcept.it
Tipo: A
Valore atteso: 216.198.79.193

Dominio: www.maskiobarberconcept.it  
Tipo: CNAME
Valore atteso: 352c99071fd5a50d.vercel-dns-017.com
```

---

## ⏰ **Tempi di Propagazione**

```
Aruba update: 30 minuti - 6 ore
Propagazione globale: 24-48 ore
Vercel detection: Automatico dopo propagazione
```

---

## 🆘 **Se DNS Aruba Non Funziona**

### **Alternativa: Cloudflare (Gratuito)**
```
1. Registrati su Cloudflare
2. Aggiungi dominio maskiobarberconcept.it
3. Configura record DNS su Cloudflare
4. Cambia nameserver su Aruba a quelli Cloudflare
```

### **Contatta Supporto Aruba**
```
Telefono: 0575 0505
Email: supporto@aruba.it
Problema: "Configurazione record DNS A e CNAME per servizio hosting esterno"
```

---

## ✅ **Checklist Verifica**

- [ ] Record A configurato: @ → 216.198.79.193
- [ ] Record CNAME configurato: www → 352c99071fd5a50d.vercel-dns-017.com  
- [ ] DNS propagato (nslookup funziona)
- [ ] Vercel mostra "Valid Configuration"
- [ ] Entrambi i domini accessibili

---

**IMPORTANTE:** I valori che ti ha dato Vercel sono specifici per il tuo progetto. Usa esattamente quelli!
