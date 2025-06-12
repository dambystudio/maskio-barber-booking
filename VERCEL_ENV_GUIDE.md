## 🖥️ Interface Vercel - Environment Variables

### Come Aggiungere le Variabili:

1. **Vai nel tuo progetto Vercel**
2. **Clicca "Settings" nel menu**
3. **Clicca "Environment Variables" nella sidebar**
4. **Per ogni variabile:**
   - **Name**: Il nome della variabile (es: `DATABASE_URL`)
   - **Value**: Il valore (es: `postgres://neondb_owner:npg_...`)
   - **Environment**: Seleziona `Production`, `Preview`, `Development` (o tutte)

### Screenshot dell'interfaccia:
```
┌─────────────────────────────────────────────────────┐
│ Environment Variables                                │
├─────────────────────────────────────────────────────┤
│ Name: [DATABASE_URL                    ] │ Add     │
│ Value: [postgres://neondb_owner:npg... ]           │
│ Environment: ☑ Production ☑ Preview ☑ Development │
└─────────────────────────────────────────────────────┘
```

### Lista Completa da Aggiungere:

**1. DATABASE_URL**
```
YOUR_NEON_DATABASE_URL_HERE
```

**2. NEXTAUTH_SECRET**
```
YOUR_GENERATED_SECRET_HERE
```

**3. NEXTAUTH_URL**
```
https://TUO-PROGETTO-VERCEL.vercel.app
```
⚠️ **CAMBIA "TUO-PROGETTO-VERCEL" con il nome effettivo!**

**4. GOOGLE_CLIENT_ID**
```
YOUR_GOOGLE_CLIENT_ID_HERE
```

**5. GOOGLE_CLIENT_SECRET**
```
YOUR_GOOGLE_CLIENT_SECRET_HERE
```

**6. GOOGLE_PLACES_API_KEY**
```
AIzaSyBAd0Rr8aXbavLEbcPACUa9FHnhIf-avss
```

**7. GOOGLE_PLACE_ID**
```
ChIJJxigKx51NxMRN_cHtkuYN-M
```

### ⚡ Tip Veloce:
- Puoi copiare/incollare direttamente dal tuo `.env.local`
- Per `NEXTAUTH_URL`: prima fai il deploy, poi aggiorna questa variabile con l'URL reale
- Seleziona "Production" per le variabili principali
