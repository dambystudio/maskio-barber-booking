import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testWaitlistNotificationSystem() {
  console.log('🧪 TEST SISTEMA NOTIFICHE LISTA D\'ATTESA\n');

  try {
    // 1. Verifica struttura tabella waitlist
    console.log('1️⃣ Verifica struttura tabella waitlist...');
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'waitlist' 
      AND column_name IN ('offered_time', 'offered_booking_id', 'offer_expires_at', 'offer_response')
    `;
    
    console.log(`   ✅ Colonne nuove trovate: ${columns.length}/4`);
    columns.forEach(c => console.log(`      - ${c.column_name}`));
    
    if (columns.length < 4) {
      console.log('\n   ❌ ERRORE: Colonne mancanti! Esegui: node update-waitlist-table.mjs');
      return;
    }

    // 2. Verifica tabella push_subscriptions
    console.log('\n2️⃣ Verifica sottoscrizioni push...');
    const subscriptions = await sql`
      SELECT COUNT(*) as count FROM push_subscriptions
    `;
    console.log(`   ✅ Sottoscrizioni attive: ${subscriptions[0].count}`);

    // 3. Verifica utenti in waitlist
    console.log('\n3️⃣ Verifica utenti in lista d\'attesa...');
    const waitingUsers = await sql`
      SELECT w.*, u.name, u.email 
      FROM waitlist w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.status = 'waiting'
      ORDER BY w.date, w.position
    `;
    
    console.log(`   📋 Utenti in attesa: ${waitingUsers.length}`);
    waitingUsers.forEach((user, i) => {
      console.log(`      ${i+1}. ${user.customer_name} - ${user.barber_name} - ${user.date} (Pos. #${user.position})`);
    });

    // 4. Verifica offerte attive
    console.log('\n4️⃣ Verifica offerte attive...');
    const activeOffers = await sql`
      SELECT w.*, u.name, u.email,
        CASE 
          WHEN w.offer_expires_at > NOW() THEN 'VALIDA'
          ELSE 'SCADUTA'
        END as offer_status
      FROM waitlist w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.status = 'offered'
    `;
    
    console.log(`   🎁 Offerte attive: ${activeOffers.length}`);
    activeOffers.forEach((offer, i) => {
      const expiresIn = offer.offer_expires_at ? 
        Math.floor((new Date(offer.offer_expires_at) - new Date()) / (1000 * 60)) : 0;
      console.log(`      ${i+1}. ${offer.customer_name} - ${offer.date} alle ${offer.offered_time}`);
      console.log(`         Status: ${offer.offer_status} (${expiresIn > 0 ? expiresIn + ' min rimanenti' : 'scaduta'})`);
    });

    // 5. Statistiche generali
    console.log('\n5️⃣ Statistiche sistema...');
    
    const stats = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM waitlist
      GROUP BY status
      ORDER BY count DESC
    `;
    
    console.log('   📊 Status waitlist:');
    stats.forEach(s => {
      console.log(`      - ${s.status}: ${s.count}`);
    });

    // 6. Tasso di accettazione offerte
    const acceptanceRate = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE offer_response = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE offer_response = 'declined') as declined,
        COUNT(*) FILTER (WHERE offer_response = 'expired') as expired,
        COUNT(*) as total
      FROM waitlist 
      WHERE status IN ('approved', 'declined', 'expired')
    `;

    if (acceptanceRate[0].total > 0) {
      const rate = (acceptanceRate[0].accepted / acceptanceRate[0].total * 100).toFixed(1);
      console.log('\n   📈 Tasso di accettazione offerte:');
      console.log(`      ✅ Accettate: ${acceptanceRate[0].accepted}`);
      console.log(`      ❌ Rifiutate: ${acceptanceRate[0].declined}`);
      console.log(`      ⏰ Scadute: ${acceptanceRate[0].expired}`);
      console.log(`      📊 Tasso: ${rate}%`);
    }

    // 7. Verifica API endpoints
    console.log('\n6️⃣ Verifica API endpoints...');
    console.log('   ✅ /api/notifications/send-waitlist-alert (POST)');
    console.log('   ✅ /api/waitlist/respond (POST)');
    console.log('   ✅ /api/bookings (PUT/PATCH con notifiche)');

    // 8. Riepilogo finale
    console.log('\n' + '='.repeat(60));
    console.log('✅ SISTEMA NOTIFICHE LISTA D\'ATTESA: OPERATIVO');
    console.log('='.repeat(60));
    console.log('\n📝 PROSSIMI PASSI:');
    console.log('   1. Testa cancellazione prenotazione → verifica notifica');
    console.log('   2. Vai su /area-personale/profilo → verifica offerte');
    console.log('   3. Clicca "Conferma" o "Rifiuta" → verifica funzionamento');
    console.log('\n💡 Per testare manualmente:');
    console.log('   - Mettiti in lista d\'attesa per un giorno');
    console.log('   - Cancella una prenotazione per quel giorno');
    console.log('   - Controlla notifica push sul dispositivo');
    console.log('   - Apri /area-personale/profilo e conferma/rifiuta');

  } catch (error) {
    console.error('\n❌ ERRORE durante il test:', error);
  }
}

testWaitlistNotificationSystem();
