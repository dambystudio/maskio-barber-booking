import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function verificaERiempi5Dicembre() {
  console.log('🔍 Verifica e preparazione 5 Dicembre 2025 per test notifiche\n');
  console.log('='.repeat(70) + '\n');

  const testDate = '2025-12-05';
  const barberId = 'michele';
  const barberName = 'Michele';

  try {
    // 1. VERIFICA STATO ATTUALE
    console.log('1️⃣ VERIFICA STATO ATTUALE\n');
    
    const existingBookings = await sql`
      SELECT id, time, customer_name, status, created_at
      FROM bookings
      WHERE date = ${testDate}
      AND barber_id = ${barberId}
      ORDER BY time
    `;

    console.log(`📅 5 Dicembre 2025 - ${barberName}`);
    console.log(`   Prenotazioni esistenti: ${existingBookings.length}\n`);

    if (existingBookings.length > 0) {
      console.log('   Dettaglio prenotazioni esistenti:');
      existingBookings.forEach(b => {
        console.log(`   - ${b.time}: ${b.customer_name} (${b.status})`);
      });
      console.log('');
    }

    // 2. DEFINISCI SLOT DA RIEMPIRE
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

    console.log('2️⃣ PREPARAZIONE PULIZIA E RIEMPIMENTO\n');
    console.log(`   Slot da riempire: ${timeSlots.length}`);
    console.log(`   Orari: ${timeSlots[0]} - ${timeSlots[timeSlots.length - 1]}\n`);

    // 3. CANCELLA PRENOTAZIONI ESISTENTI
    if (existingBookings.length > 0) {
      console.log('3️⃣ CANCELLAZIONE PRENOTAZIONI ESISTENTI\n');
      const deleted = await sql`
        DELETE FROM bookings 
        WHERE date = ${testDate} 
        AND barber_id = ${barberId}
      `;
      console.log(`   ✅ Cancellate ${existingBookings.length} prenotazioni esistenti\n`);
    } else {
      console.log('3️⃣ Nessuna prenotazione da cancellare\n');
    }

    // 4. CREA NUOVE PRENOTAZIONI
    console.log('4️⃣ CREAZIONE NUOVE PRENOTAZIONI\n');
    
    let created = 0;
    for (let i = 0; i < timeSlots.length; i++) {
      const time = timeSlots[i];
      const clientName = testClients[i];
      const serviceId = 'taglio-base';
      const serviceName = 'Taglio Base';
      const price = 20;

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
            service_id,
            service_name,
            price,
            status,
            notes
          ) VALUES (
            ${clientName},
            ${`test${i + 1}@example.com`},
            ${`+39 333 ${String(i + 1).padStart(3, '0')} 0000`},
            ${testDate},
            ${time},
            ${barberId},
            ${barberName},
            ${serviceId},
            ${serviceName},
            ${price},
            'confirmed',
            'TEST AUTOMATICO - Notifiche Waitlist'
          )
        `;
        
        console.log(`   ✅ ${time} - ${clientName}`);
        created++;
      } catch (error) {
        console.log(`   ❌ ${time} - Errore: ${error.message}`);
      }
    }

    console.log(`\n   ✅ Totale prenotazioni create: ${created}/${timeSlots.length}\n`);

    // 5. VERIFICA FINALE
    console.log('5️⃣ VERIFICA FINALE\n');
    
    const finalBookings = await sql`
      SELECT time, customer_name, status, service_name, price
      FROM bookings
      WHERE date = ${testDate}
      AND barber_id = ${barberId}
      ORDER BY time
    `;

    console.log(`   📊 Totale prenotazioni nel database: ${finalBookings.length}\n`);
    
    if (finalBookings.length > 0) {
      console.log('   Riepilogo completo:');
      finalBookings.forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.time} - ${b.customer_name} (${b.status}) - ${b.service_name} €${b.price}`);
      });
    }

    // 6. VERIFICA SLOT DISPONIBILI
    console.log('\n6️⃣ VERIFICA SLOT DISPONIBILI\n');
    
    const scheduleCheck = await sql`
      SELECT available_slots, unavailable_slots
      FROM barber_schedules
      WHERE date = ${testDate}
      AND barber_id = ${barberId}
    `;

    if (scheduleCheck.length > 0) {
      const availableSlots = JSON.parse(scheduleCheck[0].available_slots);
      const unavailableSlots = JSON.parse(scheduleCheck[0].unavailable_slots);
      
      console.log(`   Slot configurati come disponibili: ${availableSlots.length}`);
      console.log(`   Slot configurati come non disponibili: ${unavailableSlots.length}`);
      
      // Confronta con prenotazioni
      const bookedSlots = finalBookings.map(b => b.time);
      const actuallyAvailable = availableSlots.filter(slot => !bookedSlots.includes(slot));
      
      console.log(`   Slot effettivamente liberi: ${actuallyAvailable.length}`);
      
      if (actuallyAvailable.length > 0) {
        console.log(`   ⚠️ Slot ancora disponibili: ${actuallyAvailable.join(', ')}`);
      } else {
        console.log(`   ✅ Tutti gli slot sono OCCUPATI!`);
      }
    } else {
      console.log('   ⚠️ Nessuna configurazione trovata in barber_schedules per questa data');
    }

    // 7. RIEPILOGO FINALE
    console.log('\n' + '='.repeat(70));
    console.log('🎯 RIEPILOGO TEST NOTIFICHE');
    console.log('='.repeat(70) + '\n');

    if (finalBookings.length === timeSlots.length) {
      console.log('✅ Il 5 Dicembre 2025 è completamente PIENO!');
      console.log(`✅ ${finalBookings.length} prenotazioni confermate per ${barberName}`);
      console.log('✅ Database verificato e pronto per il test\n');
      
      console.log('📱 PROSSIMI PASSI PER IL TEST:');
      console.log('   1. Apri la PWA sul telefono');
      console.log('   2. Vai su "Prenota" → Michele → 5 Dicembre 2025');
      console.log('   3. Dovresti vedere "Nessun orario disponibile"');
      console.log('   4. Clicca su "📋 Lista d\'attesa"');
      console.log('   5. Iscriviti alla lista d\'attesa');
      console.log('   6. Poi cancella una prenotazione per ricevere la notifica\n');
    } else {
      console.log(`⚠️ Attenzione: solo ${finalBookings.length}/${timeSlots.length} slot prenotati`);
      console.log('   Potrebbero esserci ancora slot disponibili\n');
    }

  } catch (error) {
    console.error('❌ Errore:', error);
    console.error(error.stack);
  }
}

verificaERiempi5Dicembre();
