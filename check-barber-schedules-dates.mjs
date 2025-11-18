import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkScheduleDates() {
  try {
    console.log('🔍 CONTROLLO DATE SCHEDULE BARBIERI\n');

    const schedules = await sql`
      SELECT 
        barber_id,
        MIN(date) as prima_data,
        MAX(date) as ultima_data,
        COUNT(*) as totale_giorni
      FROM barber_schedules
      GROUP BY barber_id
      ORDER BY barber_id
    `;

    schedules.forEach(s => {
      console.log(`📅 Barbiere: ${s.barber_id}`);
      console.log(`   Prima data: ${s.prima_data}`);
      console.log(`   Ultima data: ${s.ultima_data}`);
      console.log(`   Totale giorni: ${s.totale_giorni}\n`);
    });

    // Controlla le chiusure ricorrenti
    console.log('\n🚫 CHIUSURE RICORRENTI:\n');
    const recurringClosures = await sql`
      SELECT * FROM barber_recurring_closures
    `;

    recurringClosures.forEach(c => {
      const closedDays = JSON.parse(c.closed_days);
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      const closedDayNames = closedDays.map(d => dayNames[d]).join(', ');
      console.log(`👤 ${c.barber_email}: ${closedDayNames}`);
    });

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkScheduleDates();
