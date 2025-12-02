import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkAndFree() {
  console.log('🔍 VERIFICA SITUAZIONE\n');
  console.log('═'.repeat(60));
  
  // 1. Controlla waitlist
  console.log('\n📋 LISTA D\'ATTESA per Michele - 5 Dicembre:\n');
  
  const waitlist = await sql`
    SELECT 
      w.*,
      u.email as user_email,
      ps.endpoint as has_push
    FROM waitlist w
    LEFT JOIN users u ON w.user_id = u.id
    LEFT JOIN push_subscriptions ps ON u.id = ps.user_id
    WHERE w.barber_id = 'michele'
      AND w.date = '2025-12-05'
    ORDER BY w.position, w.created_at
  `;
  
  if (waitlist.length === 0) {
    console.log('❌ Nessun utente in lista d\'attesa!\n');
    return;
  }
  
  waitlist.forEach((entry, i) => {
    console.log(`${i + 1}. ${entry.customer_name} (${entry.user_email})`);
    console.log(`   Status: ${entry.status}`);
    console.log(`   Posizione: ${entry.position}`);
    console.log(`   Push: ${entry.has_push ? '✅ Attiva' : '❌ Non attiva'}`);
    console.log(`   Creato: ${new Date(entry.created_at).toLocaleString('it-IT')}`);
    console.log('');
  });
  
  // 2. Controlla bookings
  console.log('\n📅 SLOT OCCUPATI per Michele - 5 Dicembre:\n');
  
  const bookings = await sql`
    SELECT time, customer_name, status, id
    FROM bookings
    WHERE barber_id = 'michele'
      AND date = '2025-12-05'
      AND status != 'cancelled'
    ORDER BY time
  `;
  
  console.log(`Totale slot occupati: ${bookings.length}\n`);
  bookings.forEach(b => {
    console.log(`   ${b.time} - ${b.customer_name} (${b.status})`);
  });
  
  // 3. Trova booking alle 10:00 da liberare
  console.log('\n\n🎯 LIBERO LO SLOT DELLE 10:00...\n');
  
  const slot10 = bookings.find(b => b.time === '10:00');
  
  if (!slot10) {
    console.log('❌ Slot 10:00 non trovato!\n');
    return;
  }
  
  console.log(`Cancello booking: ${slot10.id}`);
  console.log(`Cliente: ${slot10.customer_name}\n`);
  
  // Cancella il booking
  await sql`
    UPDATE bookings
    SET status = 'cancelled',
        notes = CONCAT(notes, ' - [LIBERATO PER TEST WAITLIST]'),
        updated_at = NOW()
    WHERE id = ${slot10.id}
  `;
  
  console.log('✅ Booking cancellato!\n');
  
  // 4. Invia notifica
  console.log('📤 INVIO NOTIFICA...\n');
  
  const ngrokUrl = process.env.NGROK_URL || 'https://dominical-kenneth-gasifiable.ngrok-free.dev';
  const apiUrl = `${ngrokUrl}/api/waitlist/notify`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      barberId: 'michele',
      date: '2025-12-05',
      time: '10:00'
    })
  });
  
  const result = await response.json();
  
  console.log(`Risposta API (${response.status}):`);
  console.log(JSON.stringify(result, null, 2));
  console.log('\n');
  
  if (response.ok && result.notified > 0) {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║      ✅ NOTIFICA INVIATA CON SUCCESSO! ✅        ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    
    console.log('📱 CONTROLLA IL TUO DISPOSITIVO!\n');
    console.log(`   Dovresti ricevere:`);
    console.log(`   📌 Titolo: "🎉 Posto Disponibile!"`);
    console.log(`   📌 Testo: "Michele è libero il 5 dicembre alle 10:00"`);
    console.log(`   📌 Pulsanti: "📅 Prenota" / "Ignora"\n`);
    
    if (result.user) {
      console.log(`👤 Notificato: ${result.user.name}`);
      console.log(`📧 Email: ${result.user.email}`);
      console.log(`🏆 Posizione: ${result.user.position}\n`);
    }
    
    if (result.offer) {
      const expiresAt = new Date(result.offer.expiresAt);
      console.log(`⏰ L'offerta scade: ${expiresAt.toLocaleTimeString('it-IT')}`);
      console.log(`   (hai 15 minuti per prenotare)\n`);
    }
    
    console.log('🔍 Verifica anche nel Browser:');
    console.log('   F12 → Console → cerca "[SW-PUSH]"\n');
    
  } else if (response.ok && result.notified === 0) {
    console.log('⚠️  Nessun utente notificato\n');
    console.log(`Motivo: ${result.message}\n`);
  } else {
    console.log('❌ ERRORE nell\'invio della notifica\n');
    console.log(result);
  }
}

checkAndFree().catch(console.error);
