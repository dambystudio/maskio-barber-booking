import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function addToWaitlistAndNotify() {
  console.log('📝 AGGIUNGO IN LISTA D\'ATTESA\n');
  console.log('═'.repeat(60));
  
  // 1. Trova test user
  const [testUser] = await sql`
    SELECT id, email, name FROM users WHERE email = 'test@gmail.com'
  `;
  
  console.log(`\n👤 ${testUser.name} (${testUser.email})\n`);
  
  // 2. Pulisci vecchie entry
  await sql`
    DELETE FROM waitlist
    WHERE user_id = ${testUser.id}
      AND barber_id = 'michele'
      AND date = '2025-12-05'
  `;
  
  console.log('🧹 Pulito vecchie entry\n');
  
  // 3. Aggiungi in waitlist
  const [entry] = await sql`
    INSERT INTO waitlist (
      user_id, barber_id, barber_name, date,
      service, price, customer_name, customer_email, customer_phone,
      notes, status, position
    ) VALUES (
      ${testUser.id}, 'michele', 'Michele', '2025-12-05',
      'Taglio Uomo', '18.00', ${testUser.name}, ${testUser.email}, '3331234567',
      '[TEST] In attesa notifica', 'waiting', 1
    )
    RETURNING id, status, position
  `;
  
  console.log('✅ Aggiunto in lista d\'attesa!');
  console.log(`   ID: ${entry.id}`);
  console.log(`   Status: ${entry.status}`);
  console.log(`   Posizione: ${entry.position}\n`);
  
  // 4. Verifica che lo slot 10:00 sia libero (già cancellato prima)
  const [slot10] = await sql`
    SELECT id, status FROM bookings
    WHERE barber_id = 'michele'
      AND date = '2025-12-05'
      AND time = '10:00'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  console.log(`📅 Slot 10:00 - Status: ${slot10?.status || 'libero'}\n`);
  
  if (slot10?.status === 'cancelled') {
    console.log('✅ Slot già liberato, invio notifica...\n');
  } else {
    console.log('⚠️  Slot non ancora liberato, lo libero ora...\n');
    if (slot10?.id) {
      await sql`
        UPDATE bookings
        SET status = 'cancelled',
            notes = CONCAT(notes, ' - [LIBERATO PER TEST]'),
            updated_at = NOW()
        WHERE id = ${slot10.id}
      `;
      console.log('✅ Slot liberato!\n');
    }
  }
  
  // 5. Invia notifica
  console.log('📤 INVIO NOTIFICA PUSH...\n');
  
  const ngrokUrl = process.env.NGROK_URL || 'https://dominical-kenneth-gasifiable.ngrok-free.dev';
  const response = await fetch(`${ngrokUrl}/api/waitlist/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      barberId: 'michele',
      date: '2025-12-05',
      time: '10:00'
    })
  });
  
  const result = await response.json();
  
  console.log(`Risposta API (${response.status}):\n`);
  console.log(JSON.stringify(result, null, 2));
  console.log('\n');
  
  if (response.ok && result.notified > 0) {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║          🎉 NOTIFICA INVIATA! 🎉                 ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    
    console.log('📱 CONTROLLA IL TUO TELEFONO!\n');
    console.log('   Dovresti ricevere una notifica push:\n');
    console.log('   📌 Titolo: "🎉 Posto Disponibile!"');
    console.log('   📌 Testo: "Michele è libero il 5 dicembre alle 10:00"');
    console.log('   📌 Azioni: "📅 Prenota" / "Ignora"\n');
    
    if (result.user) {
      console.log(`👤 Utente notificato: ${result.user.name}`);
      console.log(`📧 Email: ${result.user.email}`);
      console.log(`🏆 Posizione: ${result.user.position}\n`);
    }
    
    if (result.offer) {
      const expiresAt = new Date(result.offer.expiresAt);
      const now = new Date();
      const minutesLeft = Math.floor((expiresAt - now) / 60000);
      
      console.log(`⏰ Offerta scade: ${expiresAt.toLocaleTimeString('it-IT')}`);
      console.log(`   (tra ${minutesLeft} minuti)\n`);
    }
    
    console.log('🔍 Controlla anche la Console del Browser:');
    console.log('   F12 → Console → cerca "[SW-PUSH]"');
    console.log('   Dovresti vedere "🚨 [SW-PUSH] PUSH EVENT RICEVUTO!"\n');
    
  } else if (response.ok) {
    console.log('⚠️  Notifica non inviata\n');
    console.log(`Motivo: ${result.message}\n`);
    
    if (result.waitingCount > 0) {
      console.log(`📊 Utenti in lista: ${result.waitingCount}`);
      console.log('💡 Possibile causa: Nessun utente con push subscription attiva\n');
    }
  } else {
    console.log('❌ ERRORE\n');
    console.log(result);
  }
}

addToWaitlistAndNotify().catch(console.error);
