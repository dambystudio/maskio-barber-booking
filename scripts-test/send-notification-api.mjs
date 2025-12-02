import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function sendViaAPI() {
  console.log('📤 INVIO NOTIFICA VIA API /api/push/notify\n');
  console.log('═'.repeat(60));
  
  // 1. Trova test user
  const [testUser] = await sql`
    SELECT id, email, name FROM users WHERE email = 'test@gmail.com'
  `;
  
  console.log(`\n👤 ${testUser.name} (${testUser.email})`);
  console.log(`🆔 ID: ${testUser.id}\n`);
  
  // 2. Prepara notifica
  const payload = {
    userId: testUser.id,
    notification: {
      title: '🎉 Posto Disponibile!',
      body: 'Michele è libero il 5 dicembre alle 10:00. Prenota entro 15 minuti!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'waitlist-michele-2025-12-05',
      data: {
        url: '/prenota?barber=michele&date=2025-12-05&time=10:00',
        type: 'waitlist_slot_available',
        barberId: 'michele',
        date: '2025-12-05',
        time: '10:00'
      },
      actions: [
        { action: 'book', title: '📅 Prenota' },
        { action: 'dismiss', title: 'Ignora' }
      ],
      requireInteraction: true
    }
  };
  
  console.log('📦 Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n');
  
  // 3. Invia
  const ngrokUrl = process.env.NGROK_URL || 'https://dominical-kenneth-gasifiable.ngrok-free.dev';
  const apiUrl = `${ngrokUrl}/api/push/notify`;
  
  console.log(`📡 POST ${apiUrl}\n`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log(`📊 Risposta (${response.status}):\n`);
    console.log(JSON.stringify(result, null, 2));
    console.log('\n');
    
    if (response.ok) {
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║      ✅ NOTIFICA INVIATA CON SUCCESSO! ✅        ║');
      console.log('╚══════════════════════════════════════════════════╝\n');
      
      console.log('📱 CONTROLLA IL TUO TELEFONO ADESSO!\n');
      console.log('   Dovresti ricevere:\n');
      console.log('   📌 Titolo: "🎉 Posto Disponibile!"');
      console.log('   📌 Testo: "Michele è libero il 5 dicembre alle 10:00"');
      console.log('   📌 Azioni: "📅 Prenota" / "Ignora"\n');
      
      if (result.success && result.results) {
        console.log(`✅ Inviate: ${result.results.filter(r => r.success).length}`);
        console.log(`❌ Errori: ${result.results.filter(r => !r.success).length}\n`);
      }
      
      console.log('🔍 Controlla anche il Browser:');
      console.log('   F12 → Console → cerca "[SW-PUSH]"\n');
      
      // Aggiorna waitlist
      await sql`
        UPDATE waitlist
        SET status = 'offered',
            offered_time = '10:00',
            offer_expires_at = NOW() + INTERVAL '15 minutes',
            updated_at = NOW()
        WHERE user_id = ${testUser.id}
          AND barber_id = 'michele'
          AND date = '2025-12-05'
          AND status = 'waiting'
      `;
      
      console.log('✅ Waitlist aggiornata (offerta scade tra 15 min)\n');
      
    } else {
      console.log('❌ ERRORE nell\'invio\n');
      console.log(result);
    }
    
  } catch (error) {
    console.error('❌ Errore fetch:', error.message);
  }
}

sendViaAPI().catch(console.error);
