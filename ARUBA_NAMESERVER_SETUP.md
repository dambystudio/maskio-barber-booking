# 🔧 Configurazione Nameserver Vercel su Aruba

## ✅ PROCEDURA RACCOMANDATA: Nameserver Vercel

### 1️⃣ **Su Aruba Panel**

```
1. Login: https://admin.aruba.it
2. Vai in "I miei prodotti" → "Domini"
3. Clicca su: maskiobarberconcept.it
4. Cerca "Gestione DNS" o "DNS/Nameserver"
5. Modifica Nameserver
```

### 2️⃣ **Cambio Nameserver**

#### **Trova sezione Nameserver:**
- "Gestione DNS" → "Nameserver"
- Oppure "Configurazione DNS"
- Oppure "DNS Settings"

#### **Modifica da:**
```
Nameserver Aruba (default):
ns1.aruba.it
ns2.aruba.it
```

#### **Cambia in:**
```
Nameserver Personalizzati:
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### 3️⃣ **Steps Dettagliati Aruba**

```
1. Pannello Domini → maskiobarberconcept.it
2. "Gestione DNS" → "Nameserver"
3. Seleziona "Nameserver personalizzati"
4. Inserisci:
   - Nameserver 1: ns1.vercel-dns.com
   - Nameserver 2: ns2.vercel-dns.com
5. Clicca "Salva" o "Conferma"
6. Conferma modifica via email (se richiesto)
```

### 4️⃣ **Verifica Configurazione**

#### **Immediata (Windows):**
```powershell
nslookup -type=NS maskiobarberconcept.it
```
Dovrebbe mostrare: `ns1.vercel-dns.com` e `ns2.vercel-dns.com`

#### **Online Tool:**
- https://www.whatsmydns.net/
- Tipo: NS
- Dominio: maskiobarberconcept.it

### 5️⃣ **Tempi di Propagazione**
```
Aruba nameserver change: 2-6 ore
Propagazione globale: 24-48 ore
Vercel detection: Automatico dopo propagazione
```

---

## 🔄 **ALTERNATIVA: Record DNS Manuali**

### Se preferisci NON cambiare nameserver:

#### **Su Aruba - DNS Records:**
```
Tipo: A
Nome: @
Valore: 216.198.79.193

Tipo: CNAME
Nome: www  
Valore: cname.vercel-dns.com
```

---

## ⚠️ **IMPORTANTE: Cosa Succede**

### **Con Nameserver Vercel (Raccomandato):**
✅ Vercel gestisce tutto il DNS automaticamente
✅ SSL automatico
✅ Performance ottimizzate
✅ Meno configurazione manuale

### **Con Record Manuali:**
⚠️ Devi gestire ogni record DNS su Aruba
⚠️ Possibili conflitti con altri servizi
⚠️ Più complessità

---

## 🎯 **Procedura Aruba Specifica**

### **Trova la sezione giusta:**
```
Pannello Aruba può avere diversi nomi:
- "Gestione DNS"
- "Nameserver" 
- "DNS Settings"
- "Configurazione Dominio"
```

### **Se non trovi Nameserver:**
```
1. Cerca "Configurazione Avanzata"
2. Oppure "Impostazioni DNS"
3. Contatta supporto Aruba: 0575 0505
```

---

## ✅ **Verifica Finale**

### **Dopo 2-6 ore verifica:**
```powershell
# Nameserver
nslookup -type=NS maskiobarberconcept.it

# Risoluzione IP  
nslookup maskiobarberconcept.it

# Dovrebbe rispondere con IP Vercel
```

### **Su Vercel:**
```
1. Vai in Project → Settings → Domains
2. Dovrebbe comparire: ✅ "Valid Configuration"
3. SSL automaticamente attivo
4. Dominio pronto!
```

---

## 🚀 **Dopo la Configurazione**

### **Aggiorna Environment Variables su Vercel:**
```env
NEXTAUTH_URL=https://maskiobarberconcept.it
NEXT_PUBLIC_SITE_URL=https://maskiobarberconcept.it
```

### **Test Finale:**
- `https://maskiobarberconcept.it` → Funziona ✅
- `https://www.maskiobarberconcept.it` → Funziona ✅
- SSL Certificate → Presente ✅

---

**RACCOMANDAZIONE:** Usa i **Nameserver Vercel** - è più semplice e affidabile!
