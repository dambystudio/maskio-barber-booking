import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function fixIssues() {
  try {
    console.log('🔧 FIX NICOLÒ E NATALE\n');
    
    // ============================================================
    // 1. FIX: Aggiungi 18:00 a tutti i lunedì di Nicolò
    // ============================================================
    console.log('1️⃣ AGGIUNGO 18:00 AI LUNEDÌ DI NICOLÒ');
    console.log('─'.repeat(60));
    
    const nicoloMondays = await sql`
      SELECT id, date, available_slots, day_off
      FROM barber_schedules
      WHERE barber_id = 'nicolo'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      AND day_off = false
      ORDER BY date
    `;
    
    console.log(`\nTrovati ${nicoloMondays.length} lunedì da aggiornare\n`);
    
    let mondaysUpdated = 0;
    
    for (const schedule of nicoloMondays) {
      const slots = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
      
      if (!slots.includes('18:00')) {
        slots.push('18:00');
        slots.sort();
        
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify(slots)},
              updated_at = NOW()
          WHERE id = ${schedule.id}
        `;
        
        console.log(`✅ ${schedule.date}: aggiunto 18:00 (ora ${slots.length} slot)`);
        mondaysUpdated++;
      } else {
        console.log(`⏭️  ${schedule.date}: già ha 18:00`);
      }
    }
    
    console.log(`\n📊 Totale lunedì aggiornati: ${mondaysUpdated}`);
    
    // ============================================================
    // 2. FIX: 22 dicembre Nicolò (domenica) - aggiungi slot mattutini
    // ============================================================
    console.log('\n2️⃣ FIX 22 DICEMBRE - NICOLÒ');
    console.log('─'.repeat(60));
    
    const dec22Nicolo = await sql`
      SELECT id, date, available_slots, day_off
      FROM barber_schedules
      WHERE barber_id = 'nicolo'
      AND date = '2025-12-22'
    `;
    
    if (dec22Nicolo.length > 0) {
      const schedule = dec22Nicolo[0];
      
      // Slot standard domenica mattina: 09:00-12:30
      const morningSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'
      ];
      
      await sql`
        UPDATE barber_schedules
        SET available_slots = ${JSON.stringify(morningSlots)},
            updated_at = NOW()
        WHERE id = ${schedule.id}
      `;
      
      console.log(`✅ 22 dicembre: aggiornato con ${morningSlots.length} slot mattutini`);
      console.log(`   Slots: ${morningSlots.join(', ')}`);
    } else {
      console.log('❌ Schedule 22 dicembre non trovato per Nicolò');
    }
    
    // ============================================================
    // 3. FIX: 23-24 dicembre - SOLO MATTINA per tutti
    // ============================================================
    console.log('\n3️⃣ FIX 23-24 DICEMBRE - SOLO MATTINA (TUTTI I BARBIERI)');
    console.log('─'.repeat(60));
    
    const christmasDates = ['2025-12-23', '2025-12-24'];
    
    // Slot solo mattina: 09:00-12:30 (8 slot)
    const morningOnlySlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'
    ];
    
    for (const date of christmasDates) {
      console.log(`\n📅 ${date}:`);
      
      const schedules = await sql`
        SELECT bs.id, b.name, bs.available_slots, bs.day_off
        FROM barber_schedules bs
        JOIN barbers b ON bs.barber_id = b.id
        WHERE bs.date = ${date}
        ORDER BY b.name
      `;
      
      for (const schedule of schedules) {
        if (schedule.day_off) {
          console.log(`   ${schedule.name}: CHIUSO (day_off) - non modifico`);
          continue;
        }
        
        await sql`
          UPDATE barber_schedules
          SET available_slots = ${JSON.stringify(morningOnlySlots)},
              updated_at = NOW()
          WHERE id = ${schedule.id}
        `;
        
        console.log(`   ✅ ${schedule.name}: aggiornato a SOLO MATTINA (${morningOnlySlots.length} slot)`);
      }
    }
    
    // ============================================================
    // VERIFICA FINALE
    // ============================================================
    console.log('\n📊 VERIFICA FINALE');
    console.log('─'.repeat(60));
    
    // Check Nicolò Monday 18:00
    const nicoloMondayCheck = await sql`
      SELECT date, available_slots
      FROM barber_schedules
      WHERE barber_id = 'nicolo'
      AND EXTRACT(DOW FROM date::date) = 1
      AND date::date >= CURRENT_DATE
      AND day_off = false
      ORDER BY date
      LIMIT 3
    `;
    
    console.log('\n✅ Nicolò - Primi 3 lunedì:');
    for (const schedule of nicoloMondayCheck) {
      const slots = JSON.parse(schedule.available_slots);
      const has18 = slots.includes('18:00');
      console.log(`   ${schedule.date}: ${has18 ? '✅' : '❌'} 18:00 (${slots.length} slot totali)`);
    }
    
    // Check Dec 22 Nicolò
    const dec22Check = await sql`
      SELECT b.name, bs.available_slots
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE bs.date = '2025-12-22'
      AND b.name = 'Nicolò'
    `;
    
    if (dec22Check.length > 0) {
      const slots = dec22Check[0].available_slots ? JSON.parse(dec22Check[0].available_slots) : [];
      console.log(`\n✅ 22 dicembre Nicolò: ${slots.length} slot (${slots.join(', ')})`);
    }
    
    // Check Dec 23-24
    console.log('\n✅ 23-24 dicembre (solo mattina):');
    for (const date of christmasDates) {
      const schedules = await sql`
        SELECT b.name, bs.available_slots, bs.day_off
        FROM barber_schedules bs
        JOIN barbers b ON bs.barber_id = b.id
        WHERE bs.date = ${date}
        ORDER BY b.name
      `;
      
      console.log(`\n   📅 ${date}:`);
      for (const schedule of schedules) {
        if (schedule.day_off) {
          console.log(`      ${schedule.name}: CHIUSO`);
        } else {
          const slots = JSON.parse(schedule.available_slots);
          const latestSlot = slots[slots.length - 1];
          const morningOnly = latestSlot <= '12:30';
          console.log(`      ${schedule.name}: ${morningOnly ? '✅' : '❌'} SOLO MATTINA (ultimo slot: ${latestSlot})`);
        }
      }
    }
    
    console.log('\n🏁 Fix completati con successo!');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixIssues();
