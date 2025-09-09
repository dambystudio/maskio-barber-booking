import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function debugMarco1430Saturday() {
  console.log('🔍 Debug problema 14:30 sabato per Marco...\n');

  try {
    // Trova il prossimo sabato
    const today = new Date();
    const nextSaturday = new Date(today);
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    if (daysUntilSaturday === 0) nextSaturday.setDate(today.getDate() + 7); // Se oggi è sabato, prendi il prossimo
    else nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    const saturdayStr = nextSaturday.toISOString().split('T')[0];

    console.log(`📅 Testando sabato: ${saturdayStr}`);

    // 1. Controlla schedule database per Marco
    console.log('\n1. 📊 Schedule database Marco:');
    const marcoSchedule = await sql`
      SELECT available_slots, unavailable_slots
      FROM barber_schedules
      WHERE barber_id = 'marco'
      AND date = ${saturdayStr}
    `;

    if (marcoSchedule.length > 0) {
      const availableSlots = JSON.parse(marcoSchedule[0].available_slots || '[]');
      const unavailableSlots = JSON.parse(marcoSchedule[0].unavailable_slots || '[]');
      
      console.log(`   ✅ Available slots: ${availableSlots.join(', ')}`);
      console.log(`   ❌ Unavailable slots: ${unavailableSlots.join(', ')}`);
      
      const has1430 = availableSlots.includes('14:30');
      console.log(`   🕐 14:30 disponibile nel database: ${has1430 ? 'SÌ' : 'NO'}`);
      
      if (!has1430) {
        console.log(`   ⚠️ PROBLEMA: 14:30 non è negli slot disponibili!`);
      }
    } else {
      console.log(`   ⚠️ Nessun record nel database - userà generazione automatica`);
    }

    // 2. Controlla prenotazioni esistenti per le 14:30
    console.log('\n2. 📋 Prenotazioni esistenti 14:30:');
    const bookings1430 = await sql`
      SELECT customer_name, barber_id, status, created_at
      FROM bookings
      WHERE date = ${saturdayStr}
      AND time = '14:30'
    `;

    if (bookings1430.length > 0) {
      console.log(`   ⚠️ Trovate ${bookings1430.length} prenotazioni per le 14:30:`);
      bookings1430.forEach((booking, index) => {
        console.log(`      ${index + 1}. ${booking.customer_name} con ${booking.barber_id} (${booking.status})`);
        console.log(`         Creata: ${booking.created_at}`);
      });
      
      const marcoBookings = bookings1430.filter(b => b.barber_id === 'marco');
      if (marcoBookings.length > 0) {
        console.log(`   🎯 Marco ha ${marcoBookings.length} prenotazioni alle 14:30 - QUESTO È IL PROBLEMA!`);
      }
    } else {
      console.log(`   ✅ Nessuna prenotazione esistente per le 14:30`);
    }

    // 3. Controlla chiusure del barbiere
    console.log('\n3. 🚫 Chiusure barbiere Marco per sabato:');
    const marcoClosures = await sql`
      SELECT closure_type, reason
      FROM barber_closures
      WHERE barber_email = 'marcocis2006@gmail.com'
      AND closure_date = ${saturdayStr}
    `;

    if (marcoClosures.length > 0) {
      console.log(`   ⚠️ Trovate ${marcoClosures.length} chiusure:`);
      marcoClosures.forEach((closure, index) => {
        console.log(`      ${index + 1}. ${closure.closure_type} - ${closure.reason}`);
      });
    } else {
      console.log(`   ✅ Nessuna chiusura per Marco in questo sabato`);
    }

    // 4. Test della funzione generateMarcoHourlySlots
    console.log('\n4. 🔧 Test funzione generateMarcoHourlySlots:');
    function generateMarcoHourlySlots(dateString) {
      const slots = [];
      const date = new Date(dateString);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0) return slots; // Domenica
      if (dayOfWeek === 1) return ['15:00', '16:00', '17:00']; // Lunedì
      if (dayOfWeek === 6) return ['09:00', '10:00', '11:00', '12:00', '14:30', '15:30', '16:30']; // Sabato
      return ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00']; // Altri giorni
    }

    const generatedSlots = generateMarcoHourlySlots(saturdayStr);
    console.log(`   📍 Slot generati: ${generatedSlots.join(', ')}`);
    const has1430Generated = generatedSlots.includes('14:30');
    console.log(`   🕐 14:30 nella generazione: ${has1430Generated ? 'SÌ' : 'NO'}`);

    // 5. Simula la logica dell'API /api/bookings/slots
    console.log('\n5. 🌐 Simulazione API slots:');
    const allPossibleSlots = generateMarcoHourlySlots(saturdayStr);
    const bookedSlots = bookings1430
      .filter(b => b.barber_id === 'marco' && b.status !== 'cancelled')
      .map(b => b.time);
    
    const finalAvailableSlots = allPossibleSlots.filter(slot => !bookedSlots.includes(slot));
    
    console.log(`   📍 Slot possibili Marco: ${allPossibleSlots.join(', ')}`);
    console.log(`   📋 Slot prenotati Marco: ${bookedSlots.join(', ')}`);
    console.log(`   ✅ Slot finali disponibili: ${finalAvailableSlots.join(', ')}`);
    
    const final1430Available = finalAvailableSlots.includes('14:30');
    console.log(`   🎯 14:30 disponibile per cliente: ${final1430Available ? 'SÌ' : 'NO'}`);

    console.log('\n🎯 DIAGNOSI:');
    if (!final1430Available) {
      if (!has1430Generated) {
        console.log('   ❌ PROBLEMA: 14:30 non generato dalla funzione');
      } else if (bookedSlots.includes('14:30')) {
        console.log('   ❌ PROBLEMA: 14:30 già prenotato');
      } else {
        console.log('   ❌ PROBLEMA: Altra causa da investigare');
      }
    } else {
      console.log('   ✅ 14:30 dovrebbe essere disponibile');
    }

  } catch (error) {
    console.error('❌ Errore durante il debug:', error);
  }
}

debugMarco1430Saturday();
