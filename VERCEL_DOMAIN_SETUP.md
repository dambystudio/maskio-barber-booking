# 🌐 Guida Configurazione Dominio Vercel

## Step-by-Step: maskiobarberconcept.it su Vercel

### 1️⃣ **Su Vercel Dashboard**
```
1. Vai al tuo progetto maskio-barber
2. Settings → Domains  
3. Clicca "Add"
4. Inserisci: maskiobarberconcept.it
5. Clicca "Add"
```

### 2️⃣ **Vercel ti mostrerà:**
```
⚠️ Invalid Configuration
Add the following record to your DNS provider:

Type: A
Name: @  
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3️⃣ **Sul tuo DNS Provider** 
(es. Cloudflare, GoDaddy, Namecheap, ecc.)

```dns
# Record principale
Type: A
Name: @ (o root/apex)
Value: 76.76.19.61

# Sottomdominio www  
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Opzionale: certificato SSL automatico
Proxy status: Proxied (se Cloudflare)
```

### 4️⃣ **Verifica Configurazione**
```bash
# Test DNS (Windows PowerShell)
nslookup maskiobarberconcept.it
nslookup www.maskiobarberconcept.it

# Dovrebbero rispondere con IP di Vercel
```

### 5️⃣ **Su Vercel - Verifica Automatica**
- Vercel controllerà ogni pochi minuti
- Quando DNS si propaga: ✅ "Valid Configuration" 
- SSL automatico attivato
- Dominio pronto!

---

## 🔧 **Variabili Ambiente da Aggiornare:**

Dopo che il dominio è attivo, aggiorna:

```env
# .env.local e Vercel Environment Variables
NEXTAUTH_URL=https://maskiobarberconcept.it
NEXT_PUBLIC_SITE_URL=https://maskiobarberconcept.it
```

---

## ⚠️ **Possibili Problemi:**

### DNS non si propaga
- Attendi 24-48 ore massimo
- Controlla con: `nslookup maskiobarberconcept.it`

### Certificato SSL mancante
- Vercel lo genera automaticamente
- Se non funziona, rimuovi e ri-aggiungi dominio

### Redirect loop
- Controlla che DNS punti a Vercel
- Non a proxy/CDN che fa redirect

---

## ✅ **Verifica Finale:**

1. `https://maskiobarberconcept.it` → funziona ✅
2. `https://www.maskiobarberconcept.it` → funziona ✅  
3. SSL certificate → presente ✅
4. Vercel project → collegato ✅

---

**IMPORTANTE:** Usa **"Add domain"**, NON "Redirect to another domain"!
