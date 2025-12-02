# 🔧 Guida Configurazione DNS Aruba per Vercel

## Step-by-Step: Configurazione DNS su Aruba

### 1️⃣ **Accesso Pannello Aruba**
```
1. Vai su: https://admin.aruba.it
2. Login con le tue credenziali
3. Seleziona il dominio: maskiobarberconcept.it
4. Vai in "Gestione DNS" o "DNS Management"
```

### 2️⃣ **Record DNS da Configurare**

Una volta che Vercel ti ha mostrato i record, aggiungi su Aruba:

#### **Record A (Principale)**
```
Tipo: A
Nome: @ (o lascia vuoto per root)
Valore: 76.76.19.61
TTL: 3600 (o Auto)
```

#### **Record CNAME (WWW)**
```
Tipo: CNAME
Nome: www
Valore: cname.vercel-dns.com
TTL: 3600 (o Auto)
```

### 3️⃣ **Procedura su Aruba Panel**

#### **Metodo 1: DNS Avanzato (Raccomandato)**
```
1. Pannello Aruba → Domini → maskiobarberconcept.it
2. "Gestione DNS" → "DNS Avanzato"
3. Clicca "Aggiungi Record"

Per il Record A:
- Tipo: A
- Nome: @
- Valore: 76.76.19.61
- Clicca "Salva"

Per il Record CNAME:
- Tipo: CNAME  
- Nome: www
- Valore: cname.vercel-dns.com
- Clicca "Salva"
```

#### **Metodo 2: Se non hai DNS Avanzato**
```
1. Pannello Aruba → Domini → maskiobarberconcept.it
2. "Gestione DNS" → "DNS Semplice"
3. Cerca opzione "Reindirizza a IP esterno"
4. Inserisci: 76.76.19.61
```

### 4️⃣ **Verifica Configurazione**

#### **Windows PowerShell**
```powershell
# Verifica record A
nslookup maskiobarberconcept.it

# Verifica record CNAME
nslookup www.maskiobarberconcept.it

# Verifica con DNS Google
nslookup maskiobarberconcept.it 8.8.8.8
```

#### **Online Tools**
- https://www.whatsmydns.net/
- Inserisci: maskiobarberconcept.it
- Tipo: A
- Dovrebbe mostrare 76.76.19.61

### 5️⃣ **Tempi di Propagazione**
```
Aruba: 2-6 ore tipicamente
Globale: 24-48 ore massimo
```

### 6️⃣ **Verifica su Vercel**
```
1. Torna su Vercel → Domains
2. Aspetta che compaia: ✅ "Valid Configuration"
3. SSL automatico attivato
4. Dominio pronto!
```

---

## ⚠️ **Problemi Comuni Aruba**

### **DNS non si aggiorna**
```
- Aruba cache DNS aggressiva
- Prova dopo 2-6 ore
- Contatta supporto Aruba se necessario
```

### **Pannello diverso**
```
Aruba ha diversi pannelli:
- Hosting Panel
- Domain Panel  
- Business Panel

Cerca sempre "Gestione DNS" o "DNS"
```

### **Record A non accettato**
```
- Prova a eliminare record esistenti
- Alcuni piani Aruba limitano DNS personalizzato
- Verifica di avere "DNS Avanzato" attivato
```

---

## 🔧 **Configurazione Alternativa**

### **Se DNS Aruba non funziona:**
```
1. Usa Cloudflare (gratuito)
2. Cambia nameserver su Aruba:
   - ava.ns.cloudflare.com
   - noah.ns.cloudflare.com
3. Configura DNS su Cloudflare
```

---

## ✅ **Checklist Finale**

- [ ] Dominio aggiunto su Vercel
- [ ] Record A configurato su Aruba
- [ ] Record CNAME configurato su Aruba
- [ ] DNS propagato (nslookup funziona)
- [ ] Vercel mostra "Valid Configuration"
- [ ] SSL attivo
- [ ] Sito accessibile

---

## 📞 **Supporto Aruba**
Se hai problemi tecnici:
- Telefono: 0575 0505
- Email: supporto@aruba.it
- Specifica: "Configurazione record DNS per servizio esterno"

---

**IMPORTANTE:** Dopo la configurazione DNS, ricorda di aggiornare le variabili ambiente su Vercel con il nuovo dominio!
