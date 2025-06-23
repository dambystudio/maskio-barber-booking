# ✅ Record DNS Completi per Aruba

## Record da Configurare

### 1️⃣ **Record CNAME (www) - IN CORSO**
```
Nome host: www
Nome CNAME: 352c99071fd5a50d.vercel-dns-017.com
TTL: 3600
```

### 2️⃣ **Record A (dominio principale) - DA FARE**
```
Tipo: A
Nome host: @ (o root/vuoto)
Indirizzo IP: 216.198.79.193
TTL: 3600
```

---

## 🔄 **Dopo la Configurazione**

### **Test DNS (dopo 30-60 minuti):**
```powershell
# Test dominio principale
nslookup maskiobarberconcept.it
# Dovrebbe rispondere: 216.198.79.193

# Test sottomdominio www
nslookup www.maskiobarberconcept.it  
# Dovrebbe rispondere: 352c99071fd5a50d.vercel-dns-017.com
```

### **Verifica Online:**
- https://www.whatsmydns.net/
- Controlla che i record si siano propagati globalmente

---

## ⚠️ **Se non trovi Record A**

### **Cerca queste sezioni su Aruba:**
- "Gestione DNS"
- "Record DNS" 
- "DNS Avanzato"
- "Aggiungi Record"

### **Tipi di record disponibili:**
- **A** (per IP)
- **CNAME** (per alias) ✅ Fatto
- **MX** (per email)
- **TXT** (per verifiche)

---

## 🚀 **Risultato Finale**

### **Quando funziona:**
- `maskiobarberconcept.it` → Punta a Vercel
- `www.maskiobarberconcept.it` → Punta a Vercel
- Vercel mostra "Valid Configuration" ✅
- SSL automatico attivo ✅

---

## 📞 **Se hai Problemi**

### **Supporto Aruba:**
- Tel: 0575 0505
- Chiedi: "Come creare record A per servizio hosting esterno"
- Specifica IP: 216.198.79.193

---

**PROSSIMO STEP:** Dopo aver salvato il CNAME, cerca come aggiungere il Record A!
