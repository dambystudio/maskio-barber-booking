import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function preparaTest5Dicembre() {
  console.log('🔍 Preparazione Test Notifiche - 5 Dicembre 2025\n');
  console.log('='.repeat(70) + '\n');

  const testDate = '2025-12-05';
  const barberId = 'michele';
  const barberName = 'Michele';

  try {
    // 1. VERIFICA STATO ATTUALE
    console.log('1️⃣ VERIFICA STATO ATTUALE\n');
    
    const existingBookings = await sql`
      SELECT id, time, customer_name, status, service
      FROM bookings
      WHERE date = ${testDate}
      AND barber_id = ${barberId}
      ORDER BY time
    `;

    console.log(`📅 5 Dicembre 2025 - ${barberName}`);
    console.log(`   Prenotazioni esistenti: ${existingBookings.length}\n`);

    if (existingBookings.length > 0) {
      console.log('   Dettaglio:');
      existingBookings.forEach(b => {
        console.log(`   - ${b.time}: ${b.customer_name} - ${b.service} (${b.status})`);
      });
      console.log('');
    }

    // 2. SLOT DA RIEMPIRE
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30',
      '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];

    const testClients = [
      'Mario Rossi', 'Luigi Bianchi', 'Giovanni Verdi', 'Giuseppe Neri',
      'Paolo Gialli', 'Andrea Blu', 'Francesco Rosa', 'Alessandro Viola',
      'Matteo Marrone', 'Davide Azzurri', 'Simone Grigi', 'Luca Bianchi',
      'Marco Arancio', 'Stefano Celeste', 'Riccardo Verde', 'Fabio Rosso'
    ];

    console.log('2️⃣ CANCELLAZIONE PRENOTAZIONI ESISTENTI\n');
    
    if (existingBookings.length > 0) {
      await sql`
        DELETE FROM bookings 
        WHERE date = ${testDate} 
        AND barber_id = ${barberId}
      `;
      console.log(`   ✅ Cancellate ${existingBookings.length} prenotazioni\n`);
    } else {
      console.log('   ✅ Nessuna prenotazione da cancellare\n');
    }

    // 3. CREAZIONE PRENOTAZIONI
    console.log('3️⃣ CREAZIONE NUOVE PRENOTAZIONI\n');
    console.log(`   Target: ${timeSlots.length} slot dalle ${timeSlots[0]} alle ${timeSlots[timeSlots.length - 1]}\n`);

    let created = 0;
    for (let i = 0; i < timeSlots.length; i++) {
      const time = timeSlots[i];
      const clientName = testClients[i];

      try {
        await sql`
          INSERT INTO bookings (
            customer_name,
            customer_email,
            customer_phone,
            date,
            time,
            barber_id,
            barber_name,
            service,
            price,
            duration,
            status,
            notes
          ) VALUES (
            ${clientName},
            ${`test${i + 1}@waitlist.test`},
            ${`+39333${String(i + 1).padStart(7, '0')}`},
            ${testDate},
            ${time},
            ${barberId},
            ${barberName},
            'Taglio Base',
            20.00,
            30,
            'confirmed',
            'TEST WAITLIST - Prenotazione automatica per test notifiche'
          )
        `;
        
        console.log(`   ✅ ${time} - ${clientName}`);
        created++;
      } catch (error) {
        console.log(`   ❌ ${time} - ERRORE: ${error.message}`);
      }
    }

    console.log(`\n   📊 Risultato: ${created}/${timeSlots.length} prenotazioni create\n`);

    // 4. VERIFICA FINALE
    console.log('4️⃣ VERIFICA FINALE DATABASE\n');
    
    const finalBookings = await sql`
      SELECT time, customer_name, status, service, price
      FROM bookings
      WHERE date = ${testDate}
      AND barber_id = ${barberId}
      ORDER BY time
    `;

    console.log(`   📋 Prenotazioni nel database: ${finalBookings.length}\n`);

    if (finalBookings.length > 0) {
      console.log('   Elenco completo:');
      finalBookings.forEach((b, i) => {
        console.log(`   ${String(i + 1).padStart(2, ' ')}. ${b.time} - ${b.customer_name.padEnd(20)} - ${b.service} (€${b.price})`);
      });
      console.log('');
    }

    // 5. CONTROLLA SLOT LIBERI
    const bookedTimes = finalBookings.map(b => b.time);
    const missingSlots = timeSlots.filter(slot => !bookedTimes.includes(slot));

    if (missingSlots.length > 0) {
      console.log(`   ⚠️  Slot ancora liberi: ${missingSlots.join(', ')}\n`);
    } else {
      console.log(`   ✅ Tutti i ${timeSlots.length} slot sono OCCUPATI!\n`);
    }

    // 6. RIEPILOGO FINALE
    console.log('='.repeat(70));
    console.log('🎯 STATO FINALE TEST');
    console.log('='.repeat(70) + '\n');

    if (finalBookings.length >= 10) {
      console.log('✅ TEST PRONTO!\n');
      console.log(`📅 Data: 5 Dicembre 2025 (Venerdì)`);
      console.log(`👨‍💼 Barbiere: ${barberName}`);
      console.log(`📊 Prenotazioni: ${finalBookings.length}/${timeSlots.length} slot occupati`);
      console.log(`🔒 Stato: ${missingSlots.length === 0 ? 'COMPLETAMENTE PIENO' : `${missingSlots.length} slot ancora disponibili`}\n`);
      
      console.log('📱 PROSSIMI PASSI:\n');
      console.log('   1️⃣  Apri la PWA sul telefono');
      console.log('   2️⃣  Vai su "Prenota" → Michele → 5 Dicembre');
      console.log('   3️⃣  Verifica che appaia "Nessun orario disponibile"');
      console.log('   4️⃣  Clicca "📋 Lista d\'attesa"');
      console.log('   5️⃣  Iscriviti alla waitlist per questo giorno');
      console.log('   6️⃣  Torna qui e dimmi quando sei iscritto\n');
      
      console.log('🔔 TEST NOTIFICA:\n');
      console.log('   Dopo l\'iscrizione, cancellerò una prenotazione e dovresti');
      console.log('   ricevere una notifica push sul telefono!\n');

    } else {
      console.log('⚠️  ATTENZIONE: Test non completamente pronto\n');
      console.log(`   Solo ${finalBookings.length}/${timeSlots.length} slot prenotati`);
      console.log('   Potrebbero esserci ancora slot disponibili\n');
    }

  } catch (error) {
    console.error('❌ ERRORE:', error.message);
    console.error(error.stack);
  }
}

preparaTest5Dicembre();
