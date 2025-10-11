import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixMicheleMondaySchedule() {
  try {
    console.log('🔧 FIX ORARI LUNEDÌ PER MICHELE\n');
    console.log('='.repeat(80));
    
    // 1. Trova Michele
    const micheleResult = await sql`
      SELECT id, name FROM barbers WHERE name ILIKE '%michele%'
    `;
    
    if (micheleResult.length === 0) {
      console.log('❌ Michele non trovato');
      return;
    }
    
    const michele = micheleResult[0];
    console.log(`\n✅ Michele trovato: ${michele.name} (${michele.id})\n`);
    
    // 2. Trova tutti i lunedì per Michele
    const mondaySchedules = await sql`
      SELECT id, date, available_slots, unavailable_slots
      FROM barber_schedules
      WHERE barber_id = ${michele.id}
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      AND day_off = false
      ORDER BY date
    `;
    
    console.log(`📅 Trovati ${mondaySchedules.length} lunedì futuri da correggere\n`);
    
    if (mondaySchedules.length === 0) {
      console.log('✅ Nessun lunedì da correggere');
      return;
    }
    
    // 3. Per ogni lunedì, rimuovi slot mattina (09:00-12:30) e mantieni solo pomeriggio (15:00-17:30)
    const correctAfternoonSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    let updatedCount = 0;
    
    console.log('🔄 Correzione in corso...\n');
    
    for (const schedule of mondaySchedules) {
      try {
        const currentSlots = JSON.parse(schedule.available_slots || '[]');
        const morningSlots = currentSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour < 14;
        });
        
        if (morningSlots.length > 0) {
          console.log(`   📅 ${schedule.date}:`);
          console.log(`      Slot attuali: ${currentSlots.length} (${morningSlots.length} mattina, ${currentSlots.length - morningSlots.length} pomeriggio)`);
          console.log(`      🔧 Rimuovo slot mattina: ${morningSlots.join(', ')}`);
          
          // Aggiorna con solo slot pomeriggio
          await sql`
            UPDATE barber_schedules
            SET available_slots = ${JSON.stringify(correctAfternoonSlots)},
                updated_at = NOW()
            WHERE id = ${schedule.id}
          `;
          
          console.log(`      ✅ Aggiornato con 6 slot pomeriggio: ${correctAfternoonSlots.join(', ')}\n`);
          updatedCount++;
        } else {
          console.log(`   📅 ${schedule.date}: ✅ Già corretto (solo pomeriggio)\n`);
        }
      } catch (error) {
        console.error(`   ❌ Errore processando ${schedule.date}:`, error.message);
      }
    }
    
    // 4. Verifica finale
    console.log('='.repeat(80));
    console.log('📊 VERIFICA FINALE:\n');
    
    const verifySchedules = await sql`
      SELECT date, available_slots
      FROM barber_schedules
      WHERE barber_id = ${michele.id}
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      AND day_off = false
      ORDER BY date
      LIMIT 5
    `;
    
    console.log(`Primi 5 lunedì dopo correzione:\n`);
    
    verifySchedules.forEach(s => {
      const slots = JSON.parse(s.available_slots);
      const morning = slots.filter(sl => parseInt(sl.split(':')[0]) < 14);
      const afternoon = slots.filter(sl => parseInt(sl.split(':')[0]) >= 14);
      
      console.log(`   📅 ${s.date}:`);
      console.log(`      Mattina: ${morning.length} slot ${morning.length > 0 ? '⚠️ ' + morning.join(', ') : '✅'}`);
      console.log(`      Pomeriggio: ${afternoon.length} slot ${afternoon.join(', ')}`);
      console.log('');
    });
    
    console.log('='.repeat(80));
    console.log(`\n✅ Correzione completata!`);
    console.log(`   📝 Lunedì aggiornati: ${updatedCount}`);
    console.log(`   📅 Michele ora lavora SOLO pomeriggio (15:00-17:30) di lunedì\n`);
    
    // 5. Test API
    if (verifySchedules.length > 0) {
      const testDate = verifySchedules[0].date;
      console.log('='.repeat(80));
      console.log(`🌐 TEST API per ${testDate}:\n`);
      
      const apiResponse = await fetch(`http://localhost:3001/api/bookings/slots?barberId=${michele.id}&date=${testDate}`);
      
      if (apiResponse.ok) {
        const slots = await apiResponse.json();
        const available = slots.filter(s => s.available);
        
        console.log(`   ✅ API ritorna ${slots.length} slot totali`);
        console.log(`   ✅ Slot disponibili: ${available.length}`);
        
        if (slots.length === 6) {
          console.log(`   ✅ CORRETTO: Solo 6 slot (pomeriggio)\n`);
        } else if (slots.length === 14) {
          console.log(`   ⚠️  PROBLEMA: Ancora 14 slot (mattina+pomeriggio)`);
          console.log(`       Il server Next.js potrebbe avere cache. Riavvia con: npm run dev\n`);
        }
        
        // Mostra primi 3 e ultimi 3 slot
        if (slots.length > 0) {
          console.log(`   Primi slot: ${slots.slice(0, 3).map(s => `${s.time}:${s.available ? '✅' : '❌'}`).join(', ')}`);
          console.log(`   Ultimi slot: ${slots.slice(-3).map(s => `${s.time}:${s.available ? '✅' : '❌'}`).join(', ')}`);
        }
      } else {
        console.log(`   ❌ Errore API: ${apiResponse.status}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  }
}

fixMicheleMondaySchedule();
