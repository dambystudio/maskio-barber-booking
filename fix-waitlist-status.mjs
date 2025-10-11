#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

console.log('🔧 Fix status waitlist: pending → waiting\n');

try {
  // 1. Conta record con status 'pending'
  const pendingCount = await sql`
    SELECT COUNT(*) as count 
    FROM waitlist 
    WHERE status = 'pending'
  `;
  
  console.log(`📊 Record con status 'pending': ${pendingCount[0].count}`);
  
  if (pendingCount[0].count === 0) {
    console.log('✅ Nessun record da aggiornare!');
    process.exit(0);
  }
  
  // 2. Mostra alcuni esempi
  const examples = await sql`
    SELECT id, customer_name, date, status
    FROM waitlist
    WHERE status = 'pending'
    LIMIT 5
  `;
  
  console.log('\n📋 Esempi di record da aggiornare:');
  console.table(examples);
  
  // 3. Aggiorna status
  console.log('\n🔄 Aggiornamento in corso...');
  const updated = await sql`
    UPDATE waitlist
    SET status = 'waiting'
    WHERE status = 'pending'
    RETURNING id
  `;
  
  console.log(`✅ Aggiornati ${updated.length} record`);
  
  // 4. Verifica
  const finalPending = await sql`
    SELECT COUNT(*) as count 
    FROM waitlist 
    WHERE status = 'pending'
  `;
  
  const finalWaiting = await sql`
    SELECT COUNT(*) as count 
    FROM waitlist 
    WHERE status = 'waiting'
  `;
  
  console.log('\n📊 Status finale:');
  console.log(`   pending: ${finalPending[0].count}`);
  console.log(`   waiting: ${finalWaiting[0].count}`);
  
  console.log('\n✅ Fix completato!');
  
} catch (error) {
  console.error('❌ Errore:', error);
  process.exit(1);
}
