# 🆓 UPGRADE GRATUITO CON SUPABASE

## 1. Setup Supabase (2 minuti)

```bash
npm install @supabase/supabase-js
```

## 2. Schema Database
```sql
-- Tabella barbieri
CREATE TABLE barbers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  specialties TEXT[],
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella servizi
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- minuti
  price DECIMAL(10,2) NOT NULL,
  barber_id INTEGER REFERENCES barbers(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella prenotazioni
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  services JSONB NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_bookings_date_barber ON bookings(booking_date, barber_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

## 3. API Routes Aggiornate
```typescript
// /api/bookings/route.ts con Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const bookingData = await request.json()
  
  // Verifica conflitti
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('*')
    .eq('barber_id', bookingData.barber_id)
    .eq('booking_date', bookingData.booking_date)
    .overlaps('booking_time', [bookingData.booking_time, calculateEndTime(bookingData)])
  
  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: 'Orario non disponibile' }, { status: 409 })
  }
  
  // Crea prenotazione
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data[0], { status: 201 })
}
```

## 4. Costi Reali
- Supabase: €0/mese (fino 500MB DB + 2GB bandwidth)
- Vercel: €0/mese (100GB bandwidth)
- Domain: €10/anno (opzionale, puoi usare subdomain gratuito)

**TOTALE: €0/mese + €10/anno domain (opzionale)**

## 5. Vantaggi vs File System
✅ **Real Database** (PostgreSQL)
✅ **Backup automatici**
✅ **API REST generate automaticamente**
✅ **Real-time subscriptions**
✅ **Autenticazione built-in**
✅ **Dashboard admin web**
✅ **Scalabilità infinita**
✅ **SSL/Security inclusa**

## 6. Implementazione
Il passaggio richiede:
- 30 minuti setup Supabase
- 1 ora migration codice
- Deploy immediato

**Vuoi che procediamo?** 🚀
