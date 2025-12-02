# 🚀 VERCEL DATABASE SETUP - MASKIO BARBER

## 📋 RACCOMANDAZIONE PER IL TUO PROGETTO

### ✅ **SOLUZIONE OTTIMALE: Vercel Postgres**

#### **Perché Postgres per Maskio Barber:**
- ✅ **Relazioni complesse** - Barbieri ↔ Servizi ↔ Prenotazioni
- ✅ **Transazioni ACID** - Sicurezza nelle prenotazioni
- ✅ **Scaling automatico** - Cresce con il business
- ✅ **Backup automatici** - Zero perdita dati
- ✅ **SSL nativo** - Sicurezza enterprise

#### **Schema Database Ottimale:**

```sql
-- Tabella Barbieri
CREATE TABLE barbers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    image_url TEXT,
    experience TEXT,
    specialties TEXT[], -- Array PostgreSQL
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Servizi
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- minuti
    price DECIMAL(6,2) NOT NULL,
    category VARCHAR(50),
    active BOOLEAN DEFAULT true
);

-- Tabella Barbiere-Servizi (Many-to-Many)
CREATE TABLE barber_services (
    barber_id INTEGER REFERENCES barbers(id),
    service_id INTEGER REFERENCES services(id),
    PRIMARY KEY (barber_id, service_id)
);

-- Tabella Prenotazioni
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER REFERENCES barbers(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    total_duration INTEGER NOT NULL,
    total_price DECIMAL(8,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Servizi della Prenotazione
CREATE TABLE booking_services (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id),
    service_name VARCHAR(100) NOT NULL, -- Snapshot del nome
    service_price DECIMAL(6,2) NOT NULL, -- Snapshot del prezzo
    service_duration INTEGER NOT NULL -- Snapshot della durata
);

-- Indici per performance
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, booking_time);
CREATE INDEX idx_bookings_barber_date ON bookings(barber_id, booking_date);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
```

## 🔧 **SETUP COMANDO**

### 1. **Installa Vercel Postgres**
```bash
npm install @vercel/postgres
```

### 2. **Configura Environment Variables**
```bash
# Nel dashboard Vercel aggiungi:
POSTGRES_URL="your-connection-string"
POSTGRES_PRISMA_URL="your-prisma-connection-string"
POSTGRES_URL_NON_POOLING="your-non-pooling-connection-string"
```

### 3. **File di connessione**
```typescript
// lib/db.ts
import { sql } from '@vercel/postgres';

export { sql };

// Esempio query
export async function getAvailableSlots(date: string, barberId: number) {
  const { rows } = await sql`
    SELECT booking_time, total_duration 
    FROM bookings 
    WHERE booking_date = ${date} 
    AND barber_id = ${barberId}
    AND status = 'confirmed'
    ORDER BY booking_time
  `;
  return rows;
}
```

## 📊 **ALTERNATIVE**

### **VERCEL KV (Redis) - Per Cache**
```bash
npm install @vercel/kv

# Perfetto per:
- Cache degli slot disponibili
- Rate limiting
- Session management
```

### **VERCEL BLOB - Per Immagini**
```bash
npm install @vercel/blob

# Perfetto per:
- Foto barbieri
- Immagini servizi
- File uploads
```

## 💰 **COSTI STIMATI**

### **Hobby Plan (GRATIS)**
- ✅ **Database Postgres**: 1GB storage + 10K queries/mese
- ✅ **Perfetto per iniziare**
- ✅ **Scaling automatico quando necessario**

### **Pro Plan ($20/mese)**
- ✅ **Database illimitato**
- ✅ **10M queries/mese**
- ✅ **Backup automatici**
- ✅ **Support prioritario**

## 🎯 **MIGRATION PLAN**

### **Fase 1: Setup Database**
1. Crea progetto Vercel
2. Aggiungi Postgres Database
3. Importa schema SQL
4. Migra dati da JSON

### **Fase 2: Update Codice**
1. Sostituisci `booking.ts` con query SQL
2. Update API routes
3. Test completo

### **Fase 3: Deploy**
1. Environment variables
2. Deploy production
3. Verifica funzionalità

## 🚀 **RISULTATO FINALE**

### **Vantaggi Rispetto al JSON Attuale:**
- ✅ **Performance 10x migliore**
- ✅ **Concorrenza gestita automaticamente**
- ✅ **Backup automatici**
- ✅ **Scaling infinito**
- ✅ **Query complesse facili**
- ✅ **Sicurezza enterprise**

### **Zero Downtime Migration**
- ✅ **Mantieni JSON come fallback durante migrazione**
- ✅ **Test graduale**
- ✅ **Rollback immediato se necessario**

**RACCOMANDAZIONE**: Inizia con Vercel Postgres per avere una base solida e scalabile! 🎯
