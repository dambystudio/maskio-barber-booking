#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

const TEST_BARBER_ID = 'fabio';
const TEST_DATE = '2025-12-05';
const API_URL = 'http://localhost:3001';

console.log('🔍 DEBUG NOTIFICHE WAITLIST\n');
console.log('━'.repeat(80));

try {
  // 1. Verifica iscrizioni waitlist
  console.log('📋 STEP 1: Verifica iscrizioni waitlist');
  console.log(`   Barbiere: ${TEST_BARBER_ID}`);
  console.log(`   Data: ${TEST_DATE}\n`);
  
  const waitingUsers = await sql`
    SELECT 
      w.*,
      u.id as user_db_id,
      u.email as user_email,
      u.name as user_name
    FROM waitlist w
    LEFT JOIN users u ON w.user_id = u.id
    WHERE w.barber_id = ${TEST_BARBER_ID}
      AND w.date = ${TEST_DATE}
      AND w.status = 'waiting'
    ORDER BY w.created_at ASC
  `;
  
  console.log(`📊 Utenti in lista: ${waitingUsers.length}`);
  
  if (waitingUsers.length === 0) {
    console.log('❌ Nessun utente trovato con status "waiting"!');
    console.log('\n🔍 Verifica status disponibili:');
    const allStatuses = await sql`
      SELECT status, COUNT(*) as count
      FROM waitlist
      WHERE barber_id = ${TEST_BARBER_ID}
        AND date = ${TEST_DATE}
      GROUP BY status
    `;
    console.table(allStatuses);
    process.exit(1);
  }
  
  console.table(waitingUsers.map(u => ({
    id: u.id,
    user_id: u.user_id || 'NULL',
    customer_name: u.customer_name,
    customer_email: u.customer_email,
    status: u.status,
    has_user_in_db: u.user_db_id ? 'YES' : 'NO',
  })));
  
  // 2. Verifica push subscriptions
  console.log('\n📋 STEP 2: Verifica push subscriptions');
  
  for (const user of waitingUsers) {
    if (!user.user_id) {
      console.log(`⚠️  ${user.customer_name}: NO user_id (guest)`);
      continue;
    }
    
    const subscriptions = await sql`
      SELECT id, endpoint, created_at
      FROM push_subscriptions
      WHERE user_id = ${user.user_id}
    `;
    
    console.log(`${subscriptions.length > 0 ? '✅' : '❌'} ${user.user_name || user.customer_name}: ${subscriptions.length} subscription(s)`);
    
    if (subscriptions.length === 0) {
      console.log(`   ⚠️  Questo utente NON riceverà notifiche!`);
    }
  }
  
  // 3. Simula chiamata API
  console.log('\n📋 STEP 3: Chiamata API /api/waitlist/notify');
  console.log(`   POST ${API_URL}/api/waitlist/notify`);
  console.log(`   Body: { barberId: "${TEST_BARBER_ID}", date: "${TEST_DATE}" }\n`);
  
  const response = await fetch(`${API_URL}/api/waitlist/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      barberId: TEST_BARBER_ID,
      date: TEST_DATE,
    }),
  });
  
  const result = await response.json();
  
  if (response.ok) {
    console.log('✅ Risposta API OK');
    console.log(`   Notifiche inviate: ${result.notified}`);
    console.log(`   Errori: ${result.errors || 0}`);
    console.log(`   Totale in lista: ${result.totalInWaitlist}`);
    
    if (result.results && result.results.length > 0) {
      console.log('\n📊 Dettaglio per utente:');
      result.results.forEach(r => {
        const icon = r.success ? '✅' : '❌';
        console.log(`   ${icon} ${r.name}: ${r.success ? 'OK' : r.error}`);
      });
    }
  } else {
    console.log('❌ Errore API:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Error: ${result.error}`);
    console.log(`   Details: ${result.details || 'N/A'}`);
  }
  
  // 4. Verifica status aggiornato
  console.log('\n📋 STEP 4: Verifica status dopo notifica');
  
  const updatedUsers = await sql`
    SELECT id, customer_name, status
    FROM waitlist
    WHERE barber_id = ${TEST_BARBER_ID}
      AND date = ${TEST_DATE}
    ORDER BY created_at ASC
  `;
  
  console.table(updatedUsers.map(u => ({
    customer_name: u.customer_name,
    status_before: 'waiting',
    status_after: u.status,
    changed: u.status === 'notified' ? '✅' : '❌'
  })));
  
  console.log('\n' + '━'.repeat(80));
  console.log('✅ Debug completato!');
  
} catch (error) {
  console.error('\n❌ Errore:', error);
  console.error(error.stack);
  process.exit(1);
}
