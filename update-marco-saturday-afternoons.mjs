import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function updateMarcoSaturdayAfternoons() {
  console.log('🔧 Aggiornamento orari pomeridiani del sabato per Marco...\n');
  console.log('🎯 Nuovo orario pomeriggio sabato: 14:30, 15:30, 16:30\n');

  try {
    // Trova tutti i sabati di Marco
    const marcoSaturdays = await sql`
      SELECT id, date, available_slots, day_off
      FROM barber_schedules
      WHERE barber_id = 'marco'
      AND date::date >= CURRENT_DATE
      AND EXTRACT(DOW FROM date::date) = 6
      ORDER BY date::date
    `;

    console.log(`📅 Sabati di Marco da aggiornare: ${marcoSaturdays.length}\n`);

    let updatedCount = 0;

    for (const saturday of marcoSaturdays) {
      const currentSlots = JSON.parse(saturday.available_slots || '[]');
      
      // Separa slot mattutini e pomeridiani
      const morningSlots = currentSlots.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour < 14;
      });

      // Nuovi slot pomeridiani per il sabato
      const newAfternoonSlots = ['14:30', '15:30', '16:30'];
      
      // Combina mattutini e nuovi pomeridiani
      const newSlots = [...morningSlots, ...newAfternoonSlots];
      
      console.log(`📅 Sabato ${saturday.date}:`);
      console.log(`   📍 Slot attuali: ${currentSlots.join(', ')}`);
      console.log(`   🔄 Nuovi slot: ${newSlots.join(', ')}`);

      // Aggiorna il record
      await sql`
        UPDATE barber_schedules
        SET available_slots = ${JSON.stringify(newSlots)},
            updated_at = NOW()
        WHERE id = ${saturday.id}
      `;

      console.log(`   ✅ Aggiornato con successo\n`);
      updatedCount++;
    }

    console.log(`📊 Risultati:`);
    console.log(`   🔄 Sabati aggiornati: ${updatedCount}`);
    console.log(`   🎯 Orari pomeridiani sabato: 14:30, 15:30, 16:30`);

    // Ora devo anche aggiornare la funzione generateStandardSlots per i futuri sabati
    console.log(`\n🔧 Verifica: la logica per i futuri sabati sarà gestita dalla modifica del codice`);
    console.log(`💡 Ricorda di modificare la funzione generateStandardSlots per gestire i sabati di Marco`);

    // Verifica finale
    console.log(`\n🔍 Verifica finale dei primi 3 sabati aggiornati:`);
    const verifyResults = await sql`
      SELECT date, available_slots
      FROM barber_schedules
      WHERE barber_id = 'marco'
      AND date::date >= CURRENT_DATE
      AND EXTRACT(DOW FROM date::date) = 6
      ORDER BY date::date
      LIMIT 3
    `;

    verifyResults.forEach((result, index) => {
      const slots = JSON.parse(result.available_slots);
      const afternoonSlots = slots.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return hour >= 14;
      });
      console.log(`   ${index + 1}. ${result.date}: pomeriggio → ${afternoonSlots.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  }
}

updateMarcoSaturdayAfternoons();
