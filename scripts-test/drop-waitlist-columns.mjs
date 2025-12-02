#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

console.log('🔧 Rimozione colonne waitlist (metodo diretto)...\n');

try {
  // Mostra colonne prima
  console.log('📋 Colonne PRIMA della rimozione:');
  const before = await sql`
    SELECT column_name 
    FROM information_schema.columns
    WHERE table_name = 'waitlist'
    ORDER BY ordinal_position
  `;
  console.log(before.map(c => c.column_name).join(', '));
  
  console.log('\n🗑️  Rimuovendo colonne...\n');
  
  // Rimuovi le colonne una per una con query separate
  console.log('  Rimuovendo time...');
  await sql`ALTER TABLE waitlist DROP COLUMN time`;
  
  console.log('  Rimuovendo service...');
  await sql`ALTER TABLE waitlist DROP COLUMN service`;
  
  console.log('  Rimuovendo price...');
  await sql`ALTER TABLE waitlist DROP COLUMN price`;
  
  console.log('  Rimuovendo offered_time...');
  await sql`ALTER TABLE waitlist DROP COLUMN offered_time`;
  
  console.log('  Rimuovendo offered_booking_id...');
  await sql`ALTER TABLE waitlist DROP COLUMN offered_booking_id`;
  
  console.log('  Rimuovendo offer_expires_at...');
  await sql`ALTER TABLE waitlist DROP COLUMN offer_expires_at`;
  
  console.log('  Rimuovendo offer_response...');
  await sql`ALTER TABLE waitlist DROP COLUMN offer_response`;
  
  // Mostra colonne dopo
  console.log('\n📋 Colonne DOPO la rimozione:');
  const after = await sql`
    SELECT column_name 
    FROM information_schema.columns
    WHERE table_name = 'waitlist'
    ORDER BY ordinal_position
  `;
  console.log(after.map(c => c.column_name).join(', '));
  
  console.log('\n✅ Rimozione completata!');
  console.log(`   Prima: ${before.length} colonne`);
  console.log(`   Dopo: ${after.length} colonne`);
  console.log(`   Rimosse: ${before.length - after.length} colonne`);

} catch (error) {
  console.error('\n❌ Errore:', error.message);
  process.exit(1);
}
