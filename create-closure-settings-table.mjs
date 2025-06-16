#!/usr/bin/env node

/**
 * Script per aggiungere la tabella closure_settings al database
 * Questo script crea la tabella per gestire i giorni di chiusura del negozio
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Verifica che le variabili d'ambiente siano definite
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non definita nelle variabili d\'ambiente');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function createClosureSettingsTable() {
  try {
    console.log('🚀 Creazione tabella closure_settings...');
    
    // Crea la tabella
    await sql`
      CREATE TABLE IF NOT EXISTS closure_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'shop_closures',
        closed_days TEXT NOT NULL DEFAULT '[0]',
        closed_dates TEXT NOT NULL DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_by UUID REFERENCES users(id)
      );
    `;
    
    console.log('✅ Tabella closure_settings creata con successo');
    
    // Inserisci le impostazioni di default
    console.log('📝 Inserimento impostazioni di default...');
    
    await sql`
      INSERT INTO closure_settings (id, closed_days, closed_dates)
      VALUES ('shop_closures', '[0]', '[]')
      ON CONFLICT (id) DO NOTHING;
    `;
    
    console.log('✅ Impostazioni di default inserite');
    console.log('');
    console.log('🎉 Migrazione completata con successo!');
    console.log('');
    console.log('ℹ️  Le impostazioni di default includono:');
    console.log('   - Domenica (giorno 0) chiusa');
    console.log('   - Nessuna data specifica chiusa');
    
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    process.exit(1);
  }
}

// Esegui la migrazione
createClosureSettingsTable();
