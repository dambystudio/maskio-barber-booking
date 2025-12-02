import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function riempi5Dicembre() {
  console.log('📅 Riempio il 5 Dicembre 2025 per Michele\n');

  const testDate = '2025-12-05';
  const barberId = 'michele';
  const barberName = 'Michele';

  try {
    // 1. Pulisci prenotazioni esistenti
    console.log('🗑️ Cancello prenotazioni esistenti...');
    await sql`
      DELETE FROM bookings 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
    `;

    // 2. Crea 8 prenotazioni per riempire tutti gli slot
    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00', 
      '14:00', '15:00', '16:00', '17:00'
    ];

    const clientiTest = [
      'Mario Rossi',
      'Luigi Bianchi', 
      'Giovanni Verdi',
      'Alessandro Neri',
      'Francesco Gialli',
      'Matteo Blu',
      'Luca Viola',
      'Marco Arancio'
    ];

    console.log(`\n📝 Creo ${timeSlots.length} prenotazioni...\n`);

    for (let i = 0; i < timeSlots.length; i++) {
      await sql`
        INSERT INTO bookings (
          customer_name, 
          customer_email, 
          customer_phone,
          barber_id, 
          barber_name, 
          service, 
          price, 
          date, 
          time,
          duration, 
          status, 
          notes
        ) VALUES (
          ${clientiTest[i]},
          ${`test${i + 1}@example.com`},
          ${`+39333000${String(i + 1).padStart(4, '0')}`},
          ${barberId},
          ${barberName},
          'Taglio Uomo',
          25,
          ${testDate},
          ${timeSlots[i]},
          30,
          'confirmed',
          'TEST AUTOMATICO - Prenotazione di riempimento'
        )
      `;
      console.log(`   ✅ ${timeSlots[i]} - ${clientiTest[i]}`);
    }

    // 3. Verifica
    const bookings = await sql`
      SELECT * FROM bookings 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
      ORDER BY time
    `;

    console.log(`\n✅ Totale prenotazioni create: ${bookings.length}/8 slot`);
    console.log('\n📊 Riepilogo:');
    bookings.forEach((booking) => {
      console.log(`   ${booking.time} - ${booking.customer_name} (${booking.status})`);
    });

    console.log('\n🎯 Il 5 Dicembre è ora completamente PIENO!');
    console.log('\n💡 Ora sul sito:');
    console.log('   1. Vai su "Prenota"');
    console.log('   2. Seleziona "Michele"');
    console.log('   3. Seleziona "5 Dicembre 2025"');
    console.log('   4. Dovresti vedere "Nessun orario disponibile"');
    console.log('   5. Clicca "📋 Lista d\'attesa"');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

riempi5Dicembre();
