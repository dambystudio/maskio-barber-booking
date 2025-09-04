import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkMarcoSaturdays() {
  console.log('🔍 Controllo sabati di Marco...\n');

  try {
    // Trova tutti i sabati di Marco nei prossimi 2 mesi
    const marcoSaturdays = await sql`
      SELECT id, date, available_slots, day_off
      FROM barber_schedules
      WHERE barber_id = 'marco'
      AND date::date >= CURRENT_DATE
      AND EXTRACT(DOW FROM date::date) = 6
      ORDER BY date::date
      LIMIT 10
    `;

    console.log(`📅 Sabati di Marco trovati: ${marcoSaturdays.length}`);
    
    marcoSaturdays.forEach((saturday, index) => {
      const slots = JSON.parse(saturday.available_slots || '[]');
      const afternoonSlots = slots.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour >= 14;
      });
      
      console.log(`\n   ${index + 1}. Sabato ${saturday.date}:`);
      console.log(`      📍 Tutti gli slot: ${slots.join(', ')}`);
      console.log(`      🌅 Slot pomeridiani: ${afternoonSlots.join(', ')}`);
    });

    // Trova il prossimo sabato per testare
    const today = new Date();
    const nextSaturday = new Date(today);
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    const nextSaturdayStr = nextSaturday.toISOString().split('T')[0];

    console.log(`\n🎯 Prossimo sabato da modificare: ${nextSaturdayStr}`);
    
    // Controlla se esiste già un record per il prossimo sabato
    const existingSaturday = await sql`
      SELECT id, available_slots
      FROM barber_schedules
      WHERE barber_id = 'marco'
      AND date = ${nextSaturdayStr}
    `;

    if (existingSaturday.length > 0) {
      const currentSlots = JSON.parse(existingSaturday[0].available_slots || '[]');
      console.log(`   ✅ Record esistente trovato`);
      console.log(`   📍 Slot attuali: ${currentSlots.join(', ')}`);
    } else {
      console.log(`   ⚠️ Nessun record esistente per questo sabato`);
      console.log(`   💡 Verrà probabilmente generato automaticamente`);
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkMarcoSaturdays();
