# 📋 GUIDA COMPLETA - AGGIUNTA NUOVO BARBIERE

## 🎯 PANORAMICA GENERALE

Aggiungere un nuovo barbiere al sistema Maskio Barber richiede modifiche in **10 aree principali**:

1. **Database** - Tabelle `barbers`, `users`, `authorized_roles`
2. **Autenticazione** - File `.env.local` e sistema ruoli
3. **Frontend** - Dropdown selezione barbiere
4. **API Endpoints** - Gestione dati barbiere
5. **Schedule Management** - Orari e disponibilità
6. **Closure System** - Chiusure specifiche barbiere
7. **Booking System** - Prenotazioni e validazioni
8. **WhatsApp/Comunicazioni** - Numeri telefono
9. **Email System** - Notifiche e conferme
10. **Testing & Deployment** - Verifiche complete

---

## 📊 SCHEMA DATABASE ATTUALE

### Tabelle Coinvolte:

#### `barbers` (Tabella principale barbieri)
```sql
CREATE TABLE barbers (
  id VARCHAR(50) PRIMARY KEY,              -- ID custom (es: 'fabio', 'michele', 'nuovo-barbiere')
  user_id UUID REFERENCES users(id),       -- Link a tabella users (NULLABLE)
  name VARCHAR(255) NOT NULL,              -- Nome del barbiere
  email VARCHAR(255),                      -- Email del barbiere
  phone VARCHAR(20),                       -- Telefono del barbiere
  specialties TEXT,                        -- JSON array specialità ['Taglio', 'Barba', etc.]
  experience TEXT,                         -- Descrizione esperienza
  is_active BOOLEAN DEFAULT true,          -- Barbiere attivo/inattivo
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `users` (Sistema autenticazione)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer',     -- 'customer' | 'admin' | 'barber'
  phone VARCHAR(20),
  password TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `barber_schedules` (Orari barbiere)
```sql
CREATE TABLE barber_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id VARCHAR(50) REFERENCES barbers(id),
  date VARCHAR(10) NOT NULL,               -- YYYY-MM-DD
  available_slots TEXT,                    -- JSON array orari disponibili
  unavailable_slots TEXT,                  -- JSON array orari non disponibili
  day_off BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `barber_closures` (Chiusure specifiche)
```sql
CREATE TABLE barber_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_email VARCHAR(255) NOT NULL,
  closure_date VARCHAR(10) NOT NULL,       -- YYYY-MM-DD
  closure_type VARCHAR(20) NOT NULL,       -- 'full' | 'morning' | 'afternoon'
  reason TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `barber_recurring_closures` (Chiusure ricorrenti)
```sql
CREATE TABLE barber_recurring_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_email VARCHAR(255) NOT NULL,
  closed_days TEXT DEFAULT '[]',           -- JSON array [0,1,2,3,4,5,6] (dom=0, lun=1, etc.)
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 PASSI DETTAGLIATI PER AGGIUNTA

### 1. 📁 **PREPARAZIONE DATI BARBIERE**

Prima di iniziare, raccogli queste informazioni:

```javascript
const NUOVO_BARBIERE = {
  id: 'marco',                             // ID univoco (no spazi, caratteri speciali)
  name: 'Marco Rossi',                     // Nome completo
  email: 'marco.rossi@maskiobarber.com',   // Email per accesso sistema
  phone: '+39 333 123 4567',               // Telefono per WhatsApp
  specialties: [                           // Specialità del barbiere
    'Tagli moderni',
    'Tagli classici', 
    'Barba',
    'Styling'
  ],
  experience: 'Barbiere con 8 anni di esperienza...',
  // Orari di lavoro standard
  workingDays: [1,2,3,4,5,6],              // Lunedì-Sabato (0=domenica)
  workingHours: {
    morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
    afternoon: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
  }
};
```

### 2. 🗄️ **AGGIORNAMENTO DATABASE**

#### A) Inserimento nella tabella `barbers`
```sql
INSERT INTO barbers (
  id, 
  name, 
  email, 
  phone, 
  specialties, 
  experience, 
  is_active
) VALUES (
  'marco',
  'Marco Rossi',
  'marco.rossi@maskiobarber.com',
  '+39 333 123 4567',
  '["Tagli moderni", "Tagli classici", "Barba", "Styling"]',
  'Barbiere con 8 anni di esperienza specializzato in tagli moderni e styling.',
  true
);
```

#### B) Inserimento nella tabella `users` (se deve accedere al sistema)
```sql
INSERT INTO users (
  email,
  name,
  role,
  phone
) VALUES (
  'marco.rossi@maskiobarber.com',
  'Marco Rossi',
  'barber',
  '+39 333 123 4567'
);
```

#### C) Setup schedule iniziali (prossimi 30 giorni)
```sql
-- Script per generare schedule per i prossimi 30 giorni
-- Eseguire tramite script personalizzato (vedi sezione Script)
```

### 3. ⚙️ **CONFIGURAZIONE AUTENTICAZIONE**

#### A) Aggiornare `.env.local`
```bash
# Aggiungere email del nuovo barbiere
BARBER_EMAILS=fabio.cassano97@icloud.com,michelebiancofiore0230@gmail.com,marco.rossi@maskiobarber.com

# Se è anche admin
ADMIN_EMAILS=admin@maskiobarber.com,marco.rossi@maskiobarber.com
```

#### B) Verificare sistema di ruoli in `src/lib/auth.ts`
Il sistema automaticamente assegnerà il ruolo 'barber' se l'email è nella lista `BARBER_EMAILS`.

### 4. 🎨 **AGGIORNAMENTO FRONTEND**

#### A) Aggiornare `src/data/booking.ts`
```typescript
export const barbersFromData: Barber[] = [
  {
    id: 'fabio',
    name: 'Fabio',
    image: '/barbers/fabio.jpg',
    specialties: ['Tagli moderni', 'Tagli classici', 'Barba'],
  },
  {
    id: 'michele', 
    name: 'Michele',
    image: '/barbers/michele.jpg',
    specialties: ['Tagli moderni', 'Tagli classici', 'Barba'],
  },
  // NUOVO BARBIERE
  {
    id: 'marco',
    name: 'Marco',
    image: '/barbers/marco.jpg',                    // Aggiungere foto
    specialties: ['Tagli moderni', 'Tagli classici', 'Barba', 'Styling'],
  }
];

// Aggiungere servizi specifici se necessario
export const marcoSpecificServices: Service[] = [
  { id: 'taglio', name: 'Taglio', description: 'Taglio di capelli personalizzato', duration: 30, price: 20 },
  { id: 'barba', name: 'Barba', description: 'Modellatura e contorno barba', duration: 15, price: 12 },
  { id: 'taglio-e-barba', name: 'Taglio e Barba', description: 'Taglio capelli e sistemazione barba', duration: 40, price: 28 },
  { id: 'styling', name: 'Styling', description: 'Styling e finishing', duration: 20, price: 15 }
];
```

#### B) Aggiornare `src/components/BookingForm.tsx`
```typescript
// Nella funzione fetchData(), aggiungere logica per Marco
const updatedBarbers = fetchedBarbers.map(barber => {
  return {
    ...barber,
    image: `/barbers/${barber.id}.jpg`,
    availableServices: barber.name === 'Fabio' 
      ? fabioSpecificServices 
      : barber.name === 'Michele' 
        ? micheleSpecificServices 
        : barber.name === 'Marco'
          ? marcoSpecificServices 
          : servicesData
  };
});
```

### 5. 🖼️ **AGGIUNGERE FOTO BARBIERE**

```bash
# Aggiungere foto in public/barbers/
public/
  barbers/
    fabio.jpg
    michele.jpg
    marco.jpg          # NUOVA FOTO (formato: 400x400px, JPG/PNG)
```

### 6. 📅 **CONFIGURAZIONE SCHEDULE E ORARI**

#### A) Creare script per setup schedule iniziali
```javascript
// create-marco-schedules.mjs
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function createMarcoSchedules() {
  const barberId = 'marco';
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30); // Prossimi 30 giorni
  
  const workingHours = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    
    // Skip domenica (0)
    if (dayOfWeek === 0) continue;
    
    await sql`
      INSERT INTO barber_schedules (
        barber_id, 
        date, 
        available_slots, 
        day_off
      ) VALUES (
        ${barberId},
        ${dateString},
        ${JSON.stringify(workingHours)},
        false
      )
      ON CONFLICT DO NOTHING
    `;
  }
  
  console.log('✅ Schedule create per Marco per i prossimi 30 giorni');
}

createMarcoSchedules();
```

### 7. 🔒 **CONFIGURAZIONE CHIUSURE**

#### A) Setup chiusure ricorrenti (se necessario)
```sql
-- Esempio: Marco chiuso la domenica
INSERT INTO barber_recurring_closures (
  barber_email,
  closed_days,
  created_by
) VALUES (
  'marco.rossi@maskiobarber.com',
  '[0]',                    -- Domenica chiuso
  'system'
);
```

### 8. 📱 **CONFIGURAZIONE WHATSAPP**

Il sistema WhatsApp è già configurato per leggere automaticamente il telefono dalla tabella `barbers`. Verifica che il numero sia corretto:

```sql
-- Verifica telefono per WhatsApp
SELECT name, phone FROM barbers WHERE id = 'marco';
```

### 9. 📧 **CONFIGURAZIONE EMAIL**

Le email sono già configurate per funzionare automaticamente. Il sistema utilizzerà:
- Email barbiere per notifiche
- Template esistenti per conferme
- Sistema di routing basato sui ruoli

### 10. 🧪 **TESTING COMPLETO**

#### A) Script di test database
```javascript
// test-marco-setup.mjs
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function testMarcoSetup() {
  console.log('🔍 Testing Marco setup...');
  
  // 1. Verifica barbiere nel database
  const barber = await sql`SELECT * FROM barbers WHERE id = 'marco'`;
  console.log('📋 Barbiere:', barber[0] ? '✅ Trovato' : '❌ Mancante');
  
  // 2. Verifica user nel sistema
  const user = await sql`SELECT * FROM users WHERE email = 'marco.rossi@maskiobarber.com'`;
  console.log('👤 User:', user[0] ? '✅ Trovato' : '❌ Mancante');
  
  // 3. Verifica schedule
  const schedules = await sql`SELECT COUNT(*) as count FROM barber_schedules WHERE barber_id = 'marco'`;
  console.log('📅 Schedule:', schedules[0].count, 'giorni configurati');
  
  // 4. Test slot disponibili
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split('T')[0];
  
  const slots = await sql`
    SELECT available_slots FROM barber_schedules 
    WHERE barber_id = 'marco' AND date = ${dateString}
  `;
  
  if (slots[0]) {
    const availableSlots = JSON.parse(slots[0].available_slots);
    console.log('🕐 Slot domani:', availableSlots.length, 'disponibili');
  }
  
  console.log('✅ Test completato');
}

testMarcoSetup();
```

#### B) Test frontend completo
1. **Login come admin** → Verifica pannello prenotazioni
2. **Login come Marco** → Verifica modalità barbiere
3. **Test prenotazione** → Seleziona Marco come barbiere
4. **Test WhatsApp** → Verifica funzioni di contatto
5. **Test email** → Verifica notifiche

---

## 📝 SCRIPT AUTOMATIZZATI

### Script Completo Setup Nuovo Barbiere

```javascript
// setup-nuovo-barbiere.mjs
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

const NUOVO_BARBIERE = {
  id: 'marco',
  name: 'Marco Rossi',
  email: 'marco.rossi@maskiobarber.com',
  phone: '+39 333 123 4567',
  specialties: ['Tagli moderni', 'Tagli classici', 'Barba', 'Styling'],
  experience: 'Barbiere con 8 anni di esperienza specializzato in tagli moderni e styling.'
};

async function setupNewBarber() {
  try {
    console.log('🚀 Setup nuovo barbiere:', NUOVO_BARBIERE.name);
    
    // 1. Inserisci barbiere
    await sql`
      INSERT INTO barbers (
        id, name, email, phone, specialties, experience, is_active
      ) VALUES (
        ${NUOVO_BARBIERE.id},
        ${NUOVO_BARBIERE.name},
        ${NUOVO_BARBIERE.email},
        ${NUOVO_BARBIERE.phone},
        ${JSON.stringify(NUOVO_BARBIERE.specialties)},
        ${NUOVO_BARBIERE.experience},
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        specialties = EXCLUDED.specialties,
        experience = EXCLUDED.experience
    `;
    console.log('✅ Barbiere inserito nel database');
    
    // 2. Inserisci user (se non esiste)
    await sql`
      INSERT INTO users (email, name, role, phone)
      VALUES (
        ${NUOVO_BARBIERE.email},
        ${NUOVO_BARBIERE.name},
        'barber',
        ${NUOVO_BARBIERE.phone}
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = 'barber',
        phone = EXCLUDED.phone
    `;
    console.log('✅ User creato nel sistema');
    
    // 3. Crea schedule per i prossimi 30 giorni
    const workingHours = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    
    let schedulesCreated = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      
      // Skip domenica
      if (dayOfWeek === 0) continue;
      
      await sql`
        INSERT INTO barber_schedules (
          barber_id, date, available_slots, day_off
        ) VALUES (
          ${NUOVO_BARBIERE.id},
          ${dateString},
          ${JSON.stringify(workingHours)},
          false
        )
        ON CONFLICT DO NOTHING
      `;
      schedulesCreated++;
    }
    console.log(`✅ ${schedulesCreated} schedule create`);
    
    // 4. Setup chiusure ricorrenti (domenica)
    await sql`
      INSERT INTO barber_recurring_closures (
        barber_email, closed_days, created_by
      ) VALUES (
        ${NUOVO_BARBIERE.email},
        '[0]',
        'system'
      )
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Chiusure ricorrenti configurate');
    
    console.log('🎉 Setup completato con successo!');
    console.log('');
    console.log('📋 PROSSIMI PASSI:');
    console.log('1. Aggiornare .env.local con email barbiere');
    console.log('2. Aggiungere foto in public/barbers/marco.jpg');
    console.log('3. Aggiornare src/data/booking.ts');
    console.log('4. Aggiornare BookingForm.tsx per servizi specifici');
    console.log('5. Riavviare il server (npm run dev)');
    console.log('6. Testare complete flow');
    
  } catch (error) {
    console.error('❌ Errore durante setup:', error);
  }
}

setupNewBarber();
```

---

## ⚠️ CHECKLIST FINALE

### Pre-Deployment
- [ ] Database: Barbiere inserito in `barbers` table
- [ ] Database: User creato in `users` table  
- [ ] Database: Schedule creati per prossimi 30 giorni
- [ ] Database: Chiusure ricorrenti configurate
- [ ] Environment: Email aggiunta a `BARBER_EMAILS`
- [ ] Frontend: Barbiere aggiunto a `barbersFromData`
- [ ] Frontend: Servizi specifici configurati (se necessario)
- [ ] Frontend: Logica in BookingForm aggiornata
- [ ] Assets: Foto barbiere aggiunta (`/public/barbers/`)

### Testing
- [ ] Login funziona con email barbiere
- [ ] Barbiere appare nel dropdown selezione
- [ ] Orari disponibili vengono mostrati
- [ ] Prenotazioni funzionano correttamente
- [ ] WhatsApp integration funziona
- [ ] Email notifications funzionano
- [ ] Pannello prenotazioni mostra barbiere
- [ ] Chiusure specifiche funzionano

### Post-Deployment
- [ ] Monitorare log per errori
- [ ] Verificare prime prenotazioni reali
- [ ] Raccogliere feedback dal barbiere
- [ ] Ottimizzare orari se necessario

---

## 🆘 TROUBLESHOOTING

### Problema: Barbiere non appare nel dropdown
**Soluzione**: Verificare che `is_active = true` nel database e che il barbiere sia presente in `barbersFromData`.

### Problema: Nessun orario disponibile
**Soluzione**: Controllare `barber_schedules` table e verificare che `available_slots` contenga gli orari corretti.

### Problema: Errore di autenticazione
**Soluzione**: Verificare che l'email sia stata aggiunta a `BARBER_EMAILS` in `.env.local` e riavviare il server.

### Problema: WhatsApp non funziona
**Soluzione**: Verificare che il `phone` field sia corretto nel database e includa il prefisso internazionale.

### Problema: Email non inviate
**Soluzione**: Controllare configurazione Resend e verificare che il barbiere abbia un'email valida.

---

## 📞 SUPPORTO

Per problemi durante l'implementazione:
1. Controllare i log del server (`npm run dev`)
2. Verificare le query nel database
3. Testare API endpoints individualmente
4. Consultare la documentazione esistente nei file `.md`

**File di riferimento principali:**
- `BARBER_MANUAL_BOOKING_SYSTEM.md` - Sistema prenotazioni barbieri
- `WHATSAPP_BARBER_FEATURE_REPORT.md` - Integrazione WhatsApp
- `FUNZIONALITA_SITO_MASKIO_BARBER.md` - Overview completa

---

✅ **Questa guida copre tutti gli aspetti necessari per aggiungere correttamente un nuovo barbiere al sistema Maskio Barber.**
