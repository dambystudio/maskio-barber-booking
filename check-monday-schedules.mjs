import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkMondaySchedules() {
  try {
    console.log('🔍 ANALISI ORARI LUNEDÌ PER TUTTI I BARBIERI\n');
    console.log('='.repeat(80));
    
    // Prendi tutti i lunedì nel database
    const mondays = await sql`
      SELECT b.name, bs.date, bs.available_slots, bs.day_off
      FROM barbers b
      JOIN barber_schedules bs ON b.id = bs.barber_id
      WHERE EXTRACT(DOW FROM bs.date::date) = 1
      AND bs.date >= '2025-10-13'
      AND bs.date <= '2025-11-03'
      ORDER BY bs.date, b.name
    `;
    
    console.log(`\n✅ Trovati ${mondays.length} record di lunedì\n`);
    
    const grouped = {};
    mondays.forEach(m => {
      if (!grouped[m.date]) grouped[m.date] = [];
      grouped[m.date].push(m);
    });
    
    for (const [date, barbers] of Object.entries(grouped)) {
      console.log(`📅 ${date} (Lunedì):`);
      
      barbers.forEach(b => {
        if (b.day_off) {
          console.log(`   ${b.name}: DAY OFF`);
        } else {
          try {
            const slots = JSON.parse(b.available_slots);
            const morning = slots.filter(s => {
              const hour = parseInt(s.split(':')[0]);
              return hour < 14;
            });
            const afternoon = slots.filter(s => {
              const hour = parseInt(s.split(':')[0]);
              return hour >= 14;
            });
            
            console.log(`   ${b.name}: ${slots.length} slot totali`);
            console.log(`      - Mattina (9-13): ${morning.length} slot: ${morning.slice(0, 4).join(', ')}${morning.length > 4 ? '...' : ''}`);
            console.log(`      - Pomeriggio (14-19): ${afternoon.length} slot: ${afternoon.join(', ')}`);
            
            if (morning.length > 0) {
              console.log(`      ⚠️  HA SLOT MATTINA su lunedì!`);
            }
          } catch (error) {
            console.log(`   ${b.name}: Error parsing slots`);
          }
        }
      });
      console.log('');
    }
    
    // Conclusioni
    console.log('='.repeat(80));
    console.log('📊 CONCLUSIONE:\n');
    console.log('Il problema è nella funzione generateAllTimeSlots() nelle API:');
    console.log('- /api/bookings/slots/route.ts (linea 90-102)');
    console.log('- /app/api/bookings/batch-availability/route.ts (linea 152+)');
    console.log('');
    console.log('Entrambe le funzioni assumono che lunedì = solo pomeriggio (15:00-17:30)');
    console.log('MA nel database alcuni barbieri hanno anche slot della mattina!');
    console.log('');
    console.log('SOLUZIONE: Le funzioni generateAllTimeSlots dovrebbero:');
    console.log('1. NON generare slot standard per lunedì');
    console.log('2. Usare SOLO gli slot dal database (barber_schedules.available_slots)');
    console.log('3. Se non esiste record, allora usare standard (solo pomeriggio)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkMondaySchedules();
