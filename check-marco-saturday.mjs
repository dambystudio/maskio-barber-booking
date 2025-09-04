import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkMarcoSaturday() {
  console.log('🔍 Controllo orari attuali di Marco per il sabato...\n');

  try {
    // Trova il prossimo sabato
    const today = new Date();
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (6 - today.getDay()));
    const saturdayStr = nextSaturday.toISOString().split('T')[0];

    console.log(`📅 Controllo per sabato: ${saturdayStr}`);

    // Controlla gli orari esistenti per Marco nel sabato
    const marcoSchedules = await sql`
      SELECT bs.schedule_date, bs.start_time, bs.end_time, bs.time_slot
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE b.name = 'Marco'
      AND bs.schedule_date = ${saturdayStr}
      ORDER BY bs.start_time
    `;

    console.log(`\n📋 Orari attuali di Marco per sabato ${saturdayStr}:`);
    if (marcoSchedules.length === 0) {
      console.log('   ❌ Nessun orario trovato nel database');
      
      // Verifica se il barbiere Marco esiste
      const marco = await sql`
        SELECT id, name, email FROM barbers WHERE name = 'Marco'
      `;
      
      if (marco.length > 0) {
        console.log(`   ✅ Marco trovato: ID ${marco[0].id}, Email: ${marco[0].email}`);
        console.log('   💡 Probabilmente usa gli orari standard generati automaticamente');
      } else {
        console.log('   ❌ Marco non trovato nel database barbers');
      }
    } else {
      marcoSchedules.forEach((schedule, index) => {
        console.log(`   ${index + 1}. ${schedule.start_time} - ${schedule.end_time} (${schedule.time_slot} min)`);
      });
    }

    // Verifica tutti i sabati di Marco per capire il pattern
    console.log('\n🗓️ Controllo pattern generale sabati di Marco (prossimi 4 sabati):');
    
    for (let i = 0; i < 4; i++) {
      const saturday = new Date(nextSaturday);
      saturday.setDate(nextSaturday.getDate() + (i * 7));
      const satStr = saturday.toISOString().split('T')[0];
      
      const schedules = await sql`
        SELECT bs.start_time, bs.end_time
        FROM barber_schedules bs
        JOIN barbers b ON bs.barber_id = b.id
        WHERE b.name = 'Marco'
        AND bs.schedule_date = ${satStr}
        ORDER BY bs.start_time
      `;
      
      console.log(`   📅 ${satStr}:`);
      if (schedules.length === 0) {
        console.log('     ➡️ Orari standard (generati automaticamente)');
      } else {
        const afternoonSlots = schedules.filter(s => 
          parseInt(s.start_time.split(':')[0]) >= 14
        );
        console.log(`     ➡️ ${schedules.length} slot totali, ${afternoonSlots.length} pomeridiani`);
        afternoonSlots.forEach(slot => {
          console.log(`        ${slot.start_time} - ${slot.end_time}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkMarcoSaturday();
