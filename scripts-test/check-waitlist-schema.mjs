#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

console.log('🔍 Verifica colonne waitlist...\n');

// Mostra schema attuale
const schema = await sql`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'waitlist'
  ORDER BY ordinal_position
`;

console.log('📋 Colonne della tabella waitlist:');
console.table(schema);

console.log(`\nTotale colonne: ${schema.length}`);
