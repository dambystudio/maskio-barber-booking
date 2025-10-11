#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

console.log('🔧 Semplificazione schema waitlist...\n');

try {
  // 1. Mostra schema attuale
  console.log('📋 Schema attuale della tabella waitlist:');
  const currentSchema = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'waitlist'
    ORDER BY ordinal_position
  `;
  console.table(currentSchema);

  // 2. Conta record esistenti
  const countResult = await sql`SELECT COUNT(*) as count FROM waitlist`;
  console.log(`\n📊 Record esistenti: ${countResult[0].count}`);

  // 3. Backup (opzionale - crea tabella temporanea)
  console.log('\n💾 Creando backup temporaneo...');
  await sql`DROP TABLE IF EXISTS waitlist_backup_temp`;
  await sql`CREATE TABLE waitlist_backup_temp AS SELECT * FROM waitlist`;
  console.log('✅ Backup creato: waitlist_backup_temp');

  // 4. Rimuovi colonne non necessarie
  console.log('\n🗑️  Rimuovendo colonne non necessarie...');
  
  const columnsToRemove = [
    'time',
    'service', 
    'price',
    'offered_time',
    'offered_booking_id',
    'offer_expires_at',
    'offer_response'
  ];

  for (const column of columnsToRemove) {
    try {
      // Usa una query raw perché i nomi delle colonne non possono essere parametrizzati
      await sql.unsafe(`ALTER TABLE waitlist DROP COLUMN IF EXISTS ${column}`);
      console.log(`  ✅ Rimossa colonna: ${column}`);
    } catch (error) {
      console.log(`  ⚠️  Errore rimuovendo ${column}:`, error.message);
    }
  }

  // 5. Mostra schema finale
  console.log('\n📋 Schema finale della tabella waitlist:');
  const finalSchema = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'waitlist'
    ORDER BY ordinal_position
  `;
  console.table(finalSchema);

  // 6. Verifica che i dati siano ancora presenti
  const finalCount = await sql`SELECT COUNT(*) as count FROM waitlist`;
  console.log(`\n✅ Record dopo migration: ${finalCount[0].count}`);
  
  if (finalCount[0].count !== countResult[0].count) {
    console.log('⚠️  ATTENZIONE: Il numero di record è cambiato!');
  } else {
    console.log('✅ Tutti i record sono stati preservati');
  }

  console.log('\n🎉 Migration completata con successo!');
  console.log('\n📝 Nota: La tabella di backup "waitlist_backup_temp" è disponibile in caso di problemi.');
  console.log('   Per eliminarla: DROP TABLE waitlist_backup_temp;');

} catch (error) {
  console.error('\n❌ Errore durante la migration:', error);
  console.log('\n🔄 In caso di problemi, è possibile ripristinare da waitlist_backup_temp');
  process.exit(1);
}
