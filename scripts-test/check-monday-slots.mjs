import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkMondaySlots() {
  try {
    console.log('🔍 VERIFICA SLOT LUNEDÌ\n');

    const fabioEmail = 'fabio.cassano97@icloud.com';
    const nicoloEmail = 'giorgiodesa00@gmail.com';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';

    // 1. Verifica chiusure ricorrenti
    console.log('📋 CHIUSURE RICORRENTI:\n');

    const closures = await sql`
      SELECT barber_email, closed_days FROM barber_recurring_closures
    `;

    closures.forEach(c => {
      const days = JSON.parse(c.closed_days);
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      console.log(`${c.barber_email}:`);
      console.log(`   Giorni chiusi: ${days.map(d => dayNames[d]).join(', ')}`);
      if (days.includes(1)) {
        console.log(`   ⚠️ LUNEDÌ CHIUSO`);
      }
      console.log('');
    });

    // 2. Verifica schedule lunedì specifici
    const mondayDates = ['2025-12-29', '2026-01-05', '2026-01-12'];
    
    console.log('📅 SCHEDULE LUNEDÌ SPECIFICI:\n');

    for (const date of mondayDates) {
      console.log(`\n📆 ${date}:\n`);

      const schedules = await sql`
        SELECT 
          b.name,
          b.email,
          bs.available_slots,
          bs.day_off
        FROM barber_schedules bs
        JOIN barbers b ON bs.barber_id = b.id
        WHERE bs.date = ${date}
        ORDER BY b.name
      `;

      schedules.forEach(s => {
        console.log(`   ${s.name} (${s.email}):`);
        console.log(`      Day off: ${s.day_off}`);
        if (s.available_slots) {
          const slots = JSON.parse(s.available_slots);
          console.log(`      Slots: ${slots.join(', ')}`);
          if (!slots.includes('18:00')) {
            console.log(`      ❌ MANCA 18:00!`);
          } else {
            console.log(`      ✅ Ha 18:00`);
          }
        } else {
          console.log(`      ⚠️ Nessuno slot disponibile`);
        }
        console.log('');
      });
    }

    // 3. Verifica aperture eccezionali
    console.log('\n🔍 APERTURE ECCEZIONALI (lunedì con day_off=false):\n');

    const exceptionalOpenings = await sql`
      SELECT 
        b.name,
        b.email,
        bs.date,
        bs.available_slots,
        bs.day_off
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      JOIN barber_recurring_closures brc ON b.email = brc.barber_email
      WHERE EXTRACT(DOW FROM bs.date::date) = 1
      AND bs.day_off = false
      AND bs.date >= '2025-11-18'
      AND bs.date <= '2026-01-31'
      AND brc.closed_days::jsonb ? '1'
      ORDER BY bs.date, b.name
    `;

    if (exceptionalOpenings.length > 0) {
      exceptionalOpenings.forEach(o => {
        console.log(`${o.name} - ${o.date}:`);
        if (o.available_slots) {
          const slots = JSON.parse(o.available_slots);
          console.log(`   Slots: ${slots.join(', ')}`);
          if (!slots.includes('18:00')) {
            console.log(`   ❌ MANCA 18:00`);
          }
        }
        console.log('');
      });
    } else {
      console.log('Nessuna apertura eccezionale trovata\n');
    }

    console.log('✨ Verifica completata!\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  }
}

checkMondaySlots();
