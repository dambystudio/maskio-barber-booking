import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixMondaySaturdaySchedules() {
  console.log('🔧 FIX ORARI LUNEDÌ E SABATO\n');
  console.log('=' .repeat(70));

  try {
    // 1. VERIFICA STATO ATTUALE
    console.log('\n📊 STATO ATTUALE:\n');

    // Lunedì Michele
    const mondayMichele = await sql`
      SELECT date, available_slots, day_off
      FROM barber_schedules
      WHERE barber_id = 'michele'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      ORDER BY date
      LIMIT 5
    `;

    console.log('🔍 Lunedì Michele (primi 5):');
    mondayMichele.forEach(m => {
      const slots = m.day_off ? [] : JSON.parse(m.available_slots);
      console.log(`   ${m.date}: ${slots.length} slot - ${slots.join(', ') || 'CHIUSO'}`);
    });

    // Sabato tutti i barbieri
    const saturdays = await sql`
      SELECT barber_id, date, available_slots
      FROM barber_schedules
      WHERE EXTRACT(DOW FROM date::date) = 6
      AND date::date >= CURRENT_DATE
      AND available_slots LIKE '%17:30%'
      ORDER BY date, barber_id
      LIMIT 10
    `;

    console.log(`\n🔍 Sabati con 17:30 (primi 10): ${saturdays.length} trovati`);
    saturdays.forEach(s => {
      const slots = JSON.parse(s.available_slots);
      console.log(`   ${s.date} - ${s.barber_id}: ${slots.join(', ')}`);
    });

    // 2. FIX LUNEDÌ MICHELE
    console.log('\n' + '='.repeat(70));
    console.log('🔧 FIX 1: LUNEDÌ MICHELE - Solo pomeriggio 15:00-18:00\n');

    const correctMondaySlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

    const mondaysToFix = await sql`
      SELECT id, date, available_slots
      FROM barber_schedules
      WHERE barber_id = 'michele'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
    `;

    console.log(`📝 Trovati ${mondaysToFix.length} lunedì di Michele da aggiornare\n`);

    let mondayFixed = 0;
    for (const monday of mondaysToFix) {
      const currentSlots = JSON.parse(monday.available_slots);
      const slotsStr = currentSlots.join(', ');
      
      // Verifica se ha slot corretti
      const isCorrect = currentSlots.length === 7 && 
                        currentSlots.includes('18:00') && 
                        !currentSlots.includes('09:00');

      if (!isCorrect) {
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify(correctMondaySlots)},
              day_off = false,
              updated_at = NOW()
          WHERE id = ${monday.id}
        `;
        console.log(`   ✅ ${monday.date}: ${slotsStr} → 15:00-18:00 (7 slot)`);
        mondayFixed++;
      } else {
        console.log(`   ℹ️ ${monday.date}: Già corretto`);
      }
    }

    console.log(`\n✅ Lunedì Michele: ${mondayFixed} aggiornati\n`);

    // 3. CANCELLA PRENOTAZIONI LUNEDÌ MATTINA MICHELE
    console.log('='.repeat(70));
    console.log('🗑️ CANCELLAZIONE PRENOTAZIONI LUNEDÌ MATTINA MICHELE\n');

    const morningBookings = await sql`
      SELECT id, date, time, customer_name, status
      FROM bookings
      WHERE barber_id = 'michele'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      AND time < '15:00'
      AND status != 'cancelled'
    `;

    console.log(`📋 Trovate ${morningBookings.length} prenotazioni mattina lunedì\n`);

    if (morningBookings.length > 0) {
      for (const booking of morningBookings) {
        console.log(`   🗑️ Cancello: ${booking.date} ${booking.time} - ${booking.customer_name}`);
        await sql`
          UPDATE bookings
          SET status = 'cancelled',
              updated_at = NOW()
          WHERE id = ${booking.id}
        `;
      }
      console.log(`\n✅ ${morningBookings.length} prenotazioni mattina cancellate`);
    } else {
      console.log('   ✅ Nessuna prenotazione mattina da cancellare');
    }

    // 4. FIX SABATO 17:30
    console.log('\n' + '='.repeat(70));
    console.log('🔧 FIX 2: SABATO - Rimuovi slot 17:30\n');

    const saturdaysWithSlot = await sql`
      SELECT id, barber_id, date, available_slots
      FROM barber_schedules
      WHERE EXTRACT(DOW FROM date::date) = 6
      AND date::date >= CURRENT_DATE
      AND available_slots LIKE '%17:30%'
    `;

    console.log(`📝 Trovati ${saturdaysWithSlot.length} sabati con 17:30\n`);

    let saturdayFixed = 0;
    for (const saturday of saturdaysWithSlot) {
      const slots = JSON.parse(saturday.available_slots);
      const oldSlotsStr = slots.join(', ');
      const newSlots = slots.filter(slot => slot !== '17:30');
      
      await sql`
        UPDATE barber_schedules
        SET available_slots = ${JSON.stringify(newSlots)},
            updated_at = NOW()
        WHERE id = ${saturday.id}
      `;
      
      console.log(`   ✅ ${saturday.date} - ${saturday.barber_id}: Rimosso 17:30 (${slots.length} → ${newSlots.length} slot)`);
      saturdayFixed++;
    }

    console.log(`\n✅ Sabati: ${saturdayFixed} aggiornati\n`);

    // 5. CANCELLA PRENOTAZIONI SABATO 17:30
    console.log('='.repeat(70));
    console.log('🗑️ CANCELLAZIONE PRENOTAZIONI SABATO 17:30\n');

    const saturdayBookings1730 = await sql`
      SELECT id, barber_id, date, time, customer_name, status
      FROM bookings
      WHERE EXTRACT(DOW FROM date::date) = 6
      AND date::date >= CURRENT_DATE
      AND time = '17:30'
      AND status != 'cancelled'
    `;

    console.log(`📋 Trovate ${saturdayBookings1730.length} prenotazioni sabato 17:30\n`);

    if (saturdayBookings1730.length > 0) {
      for (const booking of saturdayBookings1730) {
        console.log(`   🗑️ Cancello: ${booking.date} ${booking.time} - ${booking.barber_id} - ${booking.customer_name}`);
        await sql`
          UPDATE bookings
          SET status = 'cancelled',
              updated_at = NOW()
          WHERE id = ${booking.id}
        `;
      }
      console.log(`\n✅ ${saturdayBookings1730.length} prenotazioni sabato 17:30 cancellate`);
    } else {
      console.log('   ✅ Nessuna prenotazione sabato 17:30 da cancellare');
    }

    // 6. VERIFICA FINALE
    console.log('\n' + '='.repeat(70));
    console.log('📊 VERIFICA FINALE:\n');

    // Lunedì Michele
    const finalMondayMichele = await sql`
      SELECT date, available_slots
      FROM barber_schedules
      WHERE barber_id = 'michele'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      ORDER BY date
      LIMIT 5
    `;

    console.log('✅ Lunedì Michele (primi 5):');
    finalMondayMichele.forEach(m => {
      const slots = JSON.parse(m.available_slots);
      const has18 = slots.includes('18:00') ? '✅' : '❌';
      const noMorning = !slots.includes('09:00') ? '✅' : '❌';
      console.log(`   ${m.date}: ${slots.join(', ')} ${has18} 18:00 ${noMorning} No mattina`);
    });

    // Sabati
    const finalSaturdays = await sql`
      SELECT barber_id, date, available_slots
      FROM barber_schedules
      WHERE EXTRACT(DOW FROM date::date) = 6
      AND date::date >= CURRENT_DATE
      ORDER BY date, barber_id
      LIMIT 6
    `;

    console.log('\n✅ Sabati (primi 6):');
    finalSaturdays.forEach(s => {
      const slots = JSON.parse(s.available_slots);
      const no1730 = !slots.includes('17:30') ? '✅' : '❌';
      const lastSlot = slots[slots.length - 1];
      console.log(`   ${s.date} - ${s.barber_id}: ultimo slot ${lastSlot} ${no1730} No 17:30`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('🎉 FIX COMPLETATO!\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  }
}

fixMondaySaturdaySchedules()
  .then(() => {
    console.log('✅ Script completato');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script fallito:', error);
    process.exit(1);
  });
