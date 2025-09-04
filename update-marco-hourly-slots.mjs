import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function updateMarcoToHourlySlots() {
  console.log('⏰ Aggiornamento orari Marco: da slot di 30 minuti a slot di 1 ora...\n');

  try {
    // Definisce i nuovi slot di Marco (solo ore piene)
    const generateHourlySlots = (dateString) => {
      const date = new Date(dateString);
      const dayOfWeek = date.getDay();
      
      // Domenica - chiuso
      if (dayOfWeek === 0) {
        return [];
      }
      
      // Lunedì - solo pomeriggio (15:00-17:00) 
      if (dayOfWeek === 1) {
        return ['15:00', '16:00', '17:00'];
      }
      
      // Sabato - orari modificati (9:00-12:00, 15:00-17:00)
      if (dayOfWeek === 6) {
        return ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'];
      }
      
      // Martedì-Venerdì - orari completi (9:00-12:00, 15:00-17:00)
      return ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'];
    };

    // Prendi tutti gli schedule esistenti di Marco
    const existingSchedules = await sql`
      SELECT id, date, available_slots, unavailable_slots
      FROM barber_schedules 
      WHERE barber_id = 'marco'
      ORDER BY date
    `;

    console.log(`📅 Trovati ${existingSchedules.length} schedule da aggiornare per Marco`);
    
    let updatedCount = 0;
    let skippedCount = 0;

    for (const schedule of existingSchedules) {
      const date = schedule.date;
      const newHourlySlots = generateHourlySlots(date);
      
      try {
        // Analizza gli slot attuali
        const currentSlots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
        const currentUnavailable = schedule.unavailable_slots ? JSON.parse(schedule.unavailable_slots) : [];
        
        // Verifica se è già configurato con slot orari
        const hasOnlyHourlySlots = currentSlots.every(slot => slot.endsWith(':00'));
        
        if (hasOnlyHourlySlots && currentSlots.length <= 8) {
          console.log(`   ⏭️ SKIP ${date}: già configurato con slot orari (${currentSlots.length} slot)`);
          skippedCount++;
          continue;
        }
        
        // Aggiorna con i nuovi slot orari
        await sql`
          UPDATE barber_schedules 
          SET 
            available_slots = ${JSON.stringify(newHourlySlots)},
            unavailable_slots = '[]',
            updated_at = NOW()
          WHERE id = ${schedule.id}
        `;
        
        console.log(`   ✅ AGGIORNATO ${date}:`);
        console.log(`      Prima: ${currentSlots.length} slot (${currentSlots.slice(0, 3).join(', ')}...)`);
        console.log(`      Dopo:  ${newHourlySlots.length} slot (${newHourlySlots.join(', ')})`);
        
        updatedCount++;
        
      } catch (error) {
        console.log(`   ❌ ERRORE ${date}: ${error.message}`);
      }
    }

    console.log(`\n📊 Risultati aggiornamento:`);
    console.log(`   ✅ Schedule aggiornati: ${updatedCount}`);
    console.log(`   ⏭️ Schedule già configurati: ${skippedCount}`);
    console.log(`   📅 Totale schedule: ${existingSchedules.length}`);

    // Verifica finale - mostra alcuni esempi
    console.log(`\n🔍 Verifica finale (primi 5 schedule):`);
    const verificationSchedules = await sql`
      SELECT date, available_slots 
      FROM barber_schedules 
      WHERE barber_id = 'marco'
      ORDER BY date
      LIMIT 5
    `;

    verificationSchedules.forEach((schedule, index) => {
      try {
        const slots = JSON.parse(schedule.available_slots);
        const dayOfWeek = new Date(schedule.date).toLocaleDateString('it-IT', { weekday: 'long' });
        console.log(`   ${index + 1}. ${schedule.date} (${dayOfWeek}): ${slots.join(', ')}`);
      } catch (error) {
        console.log(`   ${index + 1}. ${schedule.date}: ERRORE parsing`);
      }
    });

    console.log(`\n✅ Configurazione Marco completata!`);
    console.log(`🕐 Marco ora ha appuntamenti ogni ORA invece che ogni 30 minuti`);
    console.log(`📋 Esempio mattina: 9:00, 10:00, 11:00, 12:00`);
    console.log(`📋 Esempio pomeriggio: 15:00, 16:00, 17:00`);

  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  }
}

updateMarcoToHourlySlots();
