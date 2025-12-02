#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function checkSlotType() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const result = await client.query(
      `SELECT barber_id, available_slots, 
       pg_typeof(available_slots) as type,
       length(available_slots::text) as length
       FROM barber_schedules 
       WHERE date = '2025-12-22'
       LIMIT 1`
    );

    console.log('Tipo di available_slots:', result.rows[0]);
    
    // Prova a parsare
    const slots = result.rows[0].available_slots;
    console.log('\nValore grezzo:', slots);
    console.log('È array?:', Array.isArray(slots));
    console.log('È stringa?:', typeof slots === 'string');
    
    if (typeof slots === 'string') {
      const parsed = JSON.parse(slots);
      console.log('Parsed:', parsed);
      console.log('Parsed è array?:', Array.isArray(parsed));
      console.log('Length:', parsed.length);
    }

  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await client.end();
  }
}

checkSlotType();
