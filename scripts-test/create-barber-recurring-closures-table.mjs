// Script per creare la tabella barber_recurring_closures
// Esegui con: node create-barber-recurring-closures-table.mjs

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

async function createBarberRecurringClosuresTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating barber_recurring_closures table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS barber_recurring_closures (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        barber_email VARCHAR(255) NOT NULL,
        closed_days TEXT NOT NULL DEFAULT '[]',
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log('✅ Table barber_recurring_closures created successfully');

    // Crea un indice sull'email del barbiere per migliorare le performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_barber_recurring_closures_email 
      ON barber_recurring_closures(barber_email);
    `);

    console.log('✅ Index on barber_email created successfully');

    // Aggiungi un vincolo di unicità per barber_email (un barbiere può avere solo un record di chiusure ricorrenti)
    try {
      await client.query(`
        ALTER TABLE barber_recurring_closures 
        ADD CONSTRAINT unique_barber_email UNIQUE (barber_email);
      `);
      console.log('✅ Unique constraint on barber_email added successfully');
    } catch (constraintError) {
      if (constraintError.code === '42710') { // Already exists
        console.log('ℹ️ Unique constraint already exists');
      } else {
        throw constraintError;
      }
    }

  } catch (error) {
    console.error('❌ Error creating barber_recurring_closures table:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

createBarberRecurringClosuresTable();
