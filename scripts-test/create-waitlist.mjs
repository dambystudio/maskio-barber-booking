#!/usr/bin/env node

/**
 * Crea la tabella waitlist nel database
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🔧 === CREAZIONE TABELLA WAITLIST ===\n');

async function createWaitlistTable() {
  try {
    console.log('📝 Creando tabella waitlist...\n');

    // Crea la tabella
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        barber_id VARCHAR(50) NOT NULL REFERENCES barbers(id),
        date VARCHAR(10) NOT NULL,
        preferred_time VARCHAR(5),
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        priority INTEGER DEFAULT 0 NOT NULL,
        notified_at TIMESTAMP,
        notification_sent BOOLEAN DEFAULT false NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `;

    console.log('✅ Tabella creata!\n');

    // Crea indici
    console.log('📝 Creando indici...\n');

    await sql`CREATE INDEX IF NOT EXISTS idx_waitlist_barber_date ON waitlist(barber_id, date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at)`;

    console.log('✅ Indici creati!\n');

    // Verifica che la tabella esista
    const [result] = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'waitlist'
    `;

    if (result) {
      console.log('✅ Verifica: tabella "waitlist" trovata nel database\n');

      // Mostra struttura
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'waitlist'
        ORDER BY ordinal_position
      `;

      console.log('📋 Struttura tabella:\n');
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`   ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} ${nullable}${defaultVal}`);
      });
      console.log('');

      console.log('🎉 Migration completata con successo!');
      console.log('');
      console.log('👉 Ora puoi:');
      console.log('   1. Usare la waitlist nelle prenotazioni');
      console.log('   2. Testare il sistema di notifiche con: node test-e2e-waitlist.mjs');
      console.log('');

    } else {
      console.log('⚠️ Tabella creata ma non trovata nella verifica');
    }

  } catch (error) {
    console.error('❌ Errore durante la migration:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Verifica environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non configurata!');
  console.error('👉 Assicurati che .env.local esista con DATABASE_URL\n');
  process.exit(1);
}

createWaitlistTable();
