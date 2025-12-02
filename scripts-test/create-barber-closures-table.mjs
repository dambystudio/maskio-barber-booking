// Script per creare la tabella barber_closures
// Esegui con: node create-barber-closures-table.mjs

import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
});

async function createBarberClosuresTable() {
  const client = await pool.connect();
  
  try {
    console.log('� Creating barber_closures table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS barber_closures (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        barber_email VARCHAR(255) NOT NULL,
        closure_date VARCHAR(10) NOT NULL,
        closure_type VARCHAR(20) NOT NULL CHECK (closure_type IN ('full', 'morning', 'afternoon')),
        reason TEXT,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('✅ Table barber_closures created successfully');

    // Crea indici per migliorare le performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_barber_closures_email_date 
      ON barber_closures(barber_email, closure_date);
    `);

    console.log('✅ Index on barber_email and closure_date created successfully');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_barber_closures_date 
      ON barber_closures(closure_date);
    `);

    console.log('✅ Index on closure_date created successfully');

    // Aggiungi un vincolo di unicità per evitare duplicati
    try {
      await client.query(`
        ALTER TABLE barber_closures 
        ADD CONSTRAINT unique_barber_closure UNIQUE (barber_email, closure_date, closure_type);
      `);
      console.log('✅ Unique constraint added successfully');
    } catch (constraintError) {
      if (constraintError.code === '42710') { // Already exists
        console.log('ℹ️ Unique constraint already exists');
      } else {
        throw constraintError;
      }
    }

  } catch (error) {
    console.error('❌ Error creating barber_closures table:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

createBarberClosuresTable();
