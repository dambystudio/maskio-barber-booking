import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fullDebugWaitlist() {
  console.log('🔍 DEBUG COMPLETO WAITLIST SYSTEM\n');

  try {
    // 1. Check database entries
    console.log('=== 1. DATABASE STATUS ===');
    const waitlistEntries = await sql`
      SELECT * FROM waitlist 
      ORDER BY created_at DESC;
    `;

    console.log(`📊 Prenotazioni totali in waitlist: ${waitlistEntries.length}`);
    waitlistEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.customer_name} (${entry.customer_email})`);
      console.log(`      → Barbiere: ${entry.barber_name}`);
      console.log(`      → Data: ${entry.date}`);
      console.log(`      → Status: ${entry.status}`);
      console.log(`      → Position: ${entry.position}`);
      console.log(`      → Created: ${entry.created_at}`);
      console.log('');
    });

    // 2. Test API calls simulation
    console.log('=== 2. API CALLS SIMULATION ===');
    
    // Test per data specifica (pannello barbiere)
    const testDate = '2025-09-15';
    console.log(`🗓️ Test per data ${testDate}:`);
    const dateEntries = await sql`
      SELECT w.*, u.name as user_name, u.email as user_email
      FROM waitlist w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.status = 'waiting'
      AND w.date = ${testDate}
      ORDER BY w.barber_id ASC, w.position ASC, w.created_at ASC
    `;
    console.log(`   Risultato: ${dateEntries.length} entries per ${testDate}`);

    // Test per email utente (profilo cliente)
    const testEmail = 'prova@gmail.com';
    console.log(`📧 Test per email ${testEmail}:`);
    const emailEntries = await sql`
      SELECT w.*, u.name as user_name, u.email as user_email
      FROM waitlist w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.status = 'waiting'
      AND w.customer_email = ${testEmail}
      ORDER BY w.date ASC, w.created_at ASC
    `;
    console.log(`   Risultato: ${emailEntries.length} entries per ${testEmail}`);

    // 3. Test console.log simulation
    console.log('\n=== 3. COMPONENT DEBUG SIMULATION ===');
    
    console.log('UserWaitlist component fetch simulation:');
    console.log(`   URL: /api/waitlist?user_email=${encodeURIComponent(testEmail)}`);
    console.log(`   Data returned: ${JSON.stringify(emailEntries, null, 2)}`);

    console.log('\nWaitlistPanel component fetch simulation:');
    console.log(`   URL: /api/waitlist?date=${testDate}`);
    console.log(`   Data returned: ${JSON.stringify(dateEntries, null, 2)}`);

    // 4. API endpoint structure verification
    console.log('\n=== 4. API ENDPOINT VERIFICATION ===');
    console.log('Expected API responses:');
    console.log('   GET /api/waitlist?user_email=prova@gmail.com → Array of waitlist entries');
    console.log('   GET /api/waitlist?date=2025-09-15 → Array of waitlist entries');

    // 5. Recommendations
    console.log('\n=== 5. DEBUGGING RECOMMENDATIONS ===');
    console.log('Per verificare i problemi:');
    console.log('1. Accedi con utente prova@gmail.com per vedere la waitlist nel profilo');
    console.log('2. Nel pannello barbiere, seleziona data 15 settembre 2025');
    console.log('3. Verifica console browser per errori API');
    console.log('4. Controlla Network tab per le chiamate API');
    
    if (emailEntries.length > 0) {
      console.log('\n✅ DATI PRESENTI NEL DATABASE - Il problema è nel frontend!');
    } else {
      console.log('\n❌ NESSUN DATO NEL DATABASE - Il problema è nel salvataggio!');
    }

  } catch (error) {
    console.error('❌ Errore nel debug:', error.message);
  }
}

fullDebugWaitlist();
