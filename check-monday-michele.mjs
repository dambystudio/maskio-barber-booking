import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkMondayMichele() {
  console.log('🔍 Controllo lunedì Michele...\n');

  try {
    // 1. Trova Michele
    const michele = await sql`
      SELECT id, name, email FROM barbers WHERE id = 'michele'
    `;

    if (michele.length === 0) {
      console.error('❌ Michele non trovato nel database');
      return;
    }

    console.log('✅ Michele trovato:', michele[0].name, '-', michele[0].email, '\n');

    // 2. Trova tutti i lunedì di Michele
    const mondays = await sql`
      SELECT id, date, day_off, available_slots
      FROM barber_schedules
      WHERE barber_id = 'michele'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      ORDER BY date
      LIMIT 10
    `;

    console.log(`📅 Trovati ${mondays.length} lunedì per Michele:\n`);

    mondays.forEach(monday => {
      const slots = monday.day_off ? [] : JSON.parse(monday.available_slots);
      
      // Controlla se ci sono slot mattina (9:00-12:30)
      const morningSlots = slots.filter(s => {
        const hour = parseInt(s.split(':')[0]);
        return hour >= 9 && hour <= 12;
      });

      // Controlla se ci sono slot pomeriggio (15:00-18:00)
      const afternoonSlots = slots.filter(s => {
        const hour = parseInt(s.split(':')[0]);
        return hour >= 15 && hour <= 18;
      });

      const hasProblems = morningSlots.length > 0 || monday.day_off;

      console.log(`${hasProblems ? '❌' : '✅'} ${monday.date}`);
      console.log(`   Day off: ${monday.day_off}`);
      console.log(`   Slot mattina (9-12): ${morningSlots.length} slot ${morningSlots.length > 0 ? '⚠️ PROBLEMA!' : '✓'}`);
      if (morningSlots.length > 0) {
        console.log(`      ${morningSlots.join(', ')}`);
      }
      console.log(`   Slot pomeriggio (15-18): ${afternoonSlots.length} slot ${afternoonSlots.length === 7 ? '✓' : '⚠️'}`);
      if (afternoonSlots.length > 0) {
        console.log(`      ${afternoonSlots.join(', ')}`);
      }
      console.log('');
    });

    // 3. Trova prenotazioni mattina lunedì per Michele
    console.log('🔍 Cerco prenotazioni mattina lunedì per Michele...\n');

    const morningBookings = await sql`
      SELECT id, date, time, customer_name, customer_phone, status
      FROM bookings
      WHERE barber_id = 'michele'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      AND EXTRACT(HOUR FROM time::time) < 15
      AND status != 'cancelled'
      ORDER BY date, time
    `;

    if (morningBookings.length === 0) {
      console.log('✅ Nessuna prenotazione mattina trovata\n');
    } else {
      console.log(`⚠️ Trovate ${morningBookings.length} prenotazioni mattina da cancellare:\n`);
      morningBookings.forEach(booking => {
        console.log(`   ${booking.id.substring(0, 8)}... - ${booking.date} ${booking.time}`);
        console.log(`      Cliente: ${booking.customer_name} (${booking.customer_phone})`);
        console.log(`      Status: ${booking.status}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  }
}

checkMondayMichele()
  .then(() => {
    console.log('✅ Controllo completato');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
