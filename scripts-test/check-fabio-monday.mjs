import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkFabioMonday() {
  try {
    console.log('🔍 VERIFICA ORARI LUNEDÌ PER FABIO\n');
    
    const fabioResult = await sql`SELECT id, name FROM barbers WHERE name ILIKE '%fabio%'`;
    
    if (fabioResult.length === 0) {
      console.log('❌ Fabio non trovato');
      return;
    }
    
    const fabio = fabioResult[0];
    console.log(`✅ Fabio: ${fabio.name} (${fabio.id})\n`);
    
    const mondaySchedules = await sql`
      SELECT date, available_slots
      FROM barber_schedules
      WHERE barber_id = ${fabio.id}
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      ORDER BY date
      LIMIT 3
    `;
    
    console.log(`📅 Primi 3 lunedì di Fabio:\n`);
    
    mondaySchedules.forEach(s => {
      const slots = JSON.parse(s.available_slots);
      const morning = slots.filter(sl => parseInt(sl.split(':')[0]) < 14);
      const afternoon = slots.filter(sl => parseInt(sl.split(':')[0]) >= 14);
      
      console.log(`   ${s.date}:`);
      console.log(`      Total: ${slots.length} slot`);
      console.log(`      Mattina: ${morning.length} slot ${morning.length > 0 ? morning.join(', ') : ''}`);
      console.log(`      Pomeriggio: ${afternoon.length} slot ${afternoon.join(', ')}`);
      console.log('');
    });
    
    console.log('\n❓ Fabio lavora anche la mattina di lunedì o solo pomeriggio come Michele?');
    console.log('   Se solo pomeriggio, esegui fix anche per Fabio con lo stesso script.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkFabioMonday();
