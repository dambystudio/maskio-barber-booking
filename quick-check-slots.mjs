#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function quickCheck() {
  const result = await sql`
    SELECT barber_id, available_slots
    FROM barber_schedules
    WHERE date = '2025-12-22'
    LIMIT 1
  `;
  
  console.log('Barber:', result[0].barber_id);
  console.log('Type:', typeof result[0].available_slots);
  console.log('Is Array:', Array.isArray(result[0].available_slots));
  console.log('Value:', result[0].available_slots);
  console.log('Length:', result[0].available_slots.length);
}

quickCheck();
