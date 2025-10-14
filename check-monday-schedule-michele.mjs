import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkMondaySchedule() {
  try {
    console.log('🔍 Controllo schedule del lunedì per Michele...\n');
    
    // Trova l'ID di Michele
    const barbers = await sql`
      SELECT id, name, email FROM barbers
      WHERE name ILIKE '%michele%'
    `;
    
    if (barbers.length === 0) {
      console.log('❌ Michele non trovato nel database');
      return;
    }
    
    const michele = barbers[0];
    console.log('✅ Michele trovato:', {
      id: michele.id,
      name: michele.name,
      email: michele.email
    });
    console.log('');
    
    // Trova tutti i lunedì nelle schedule
    const schedules = await sql`
      SELECT date, available_slots, unavailable_slots, day_off
      FROM barber_schedules
      WHERE barber_id = ${michele.id}
      AND EXTRACT(DOW FROM date::date) = 1
      ORDER BY date DESC
      LIMIT 10
    `;
    
    console.log(`📅 Trovati ${schedules.length} lunedì nelle schedule:\n`);
    
    schedules.forEach((schedule, index) => {
      console.log(`${index + 1}. Data: ${schedule.date}`);
      console.log(`   Day Off: ${schedule.day_off}`);
      
      if (schedule.available_slots) {
        const available = JSON.parse(schedule.available_slots);
        console.log(`   Available Slots (${available.length}):`, available);
        
        // Controlla se ci sono slot mattutini
        const morningSlots = available.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 9 && hour <= 12;
        });
        
        const afternoonSlots = available.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 15 && hour <= 18;
        });
        
        if (morningSlots.length > 0) {
          console.log(`   ⚠️  PROBLEMA: Slot mattutini trovati (${morningSlots.length}):`, morningSlots);
        }
        
        if (!available.includes('18:00')) {
          console.log(`   ⚠️  PROBLEMA: Slot 18:00 MANCANTE!`);
        }
        
        console.log(`   ✅ Pomeriggio (${afternoonSlots.length}):`, afternoonSlots);
      }
      
      if (schedule.unavailable_slots) {
        const unavailable = JSON.parse(schedule.unavailable_slots);
        console.log(`   Unavailable Slots (${unavailable.length}):`, unavailable);
      }
      
      console.log('');
    });
    
    // Mostra cosa DOVREBBE essere
    console.log('\n📋 CORRETTO per Michele il lunedì:');
    console.log('   Available Slots: ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"]');
    console.log('   Unavailable Slots: []');
    console.log('   Day Off: false');
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkMondaySchedule();
