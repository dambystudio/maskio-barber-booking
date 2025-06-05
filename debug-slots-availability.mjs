// Script per debuggare la disponibilità degli slot
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

// Simula la funzione API per controllare gli slot
function generateTimeSlots() {
  const slots = [];
  
  // Slot mattina: 9:00-12:30 (incluso 12:30)
  for (let hour = 9; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Stop at 12:30 for the last morning slot
      if (hour === 12 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time: timeString,
        available: true,
        period: 'morning'
      });
    }
  }
  
  // Slot pomeriggio: 14:30-18:00 (incluso 18:00)
  for (let hour = 14; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Start from 14:30, not 14:00
      if (hour === 14 && minute === 0) continue;
      // Stop at 18:00 for the last afternoon slot
      if (hour === 18 && minute > 0) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time: timeString,
        available: true,
        period: 'afternoon'
      });
    }
  }
  
  return slots;
}

async function debugSlots() {
  console.log('🔍 Debug disponibilità slot...\n');
  
  try {
    // 1. Controlla prenotazioni esistenti
    const bookings = await sql`SELECT COUNT(*) as count FROM bookings`;
    console.log(`📊 Prenotazioni nel database: ${bookings[0].count}`);
    
    // 2. Controlla tabelle orari
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%schedule%'
    `;
    console.log('\n📋 Tabelle schedule trovate:');
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
    // 3. Controlla barber_schedules se esiste
    try {
      const schedules = await sql`SELECT * FROM barber_schedules LIMIT 5`;
      console.log('\n⏰ Configurazioni orari barbieri:');
      schedules.forEach(schedule => {
        console.log(`  - Barbiere ${schedule.barber_id}: ${schedule.day_of_week} ${schedule.start_time}-${schedule.end_time}`);
      });
    } catch (error) {
      console.log('\n⚠️ Tabella barber_schedules non trovata o vuota');
    }
    
    // 4. Genera slot teorici
    console.log('\n🕐 Slot teorici generati:');
    const theoreticalSlots = generateTimeSlots();
    theoreticalSlots.forEach(slot => {
      console.log(`  ${slot.time} (${slot.period}) - Disponibile: ${slot.available}`);
    });
    
    // 5. Test date specifiche
    const testDates = [
      '2025-06-06', // Venerdì
      '2025-06-07', // Sabato
      '2025-06-09', // Lunedì
    ];
    
    console.log('\n📅 Test disponibilità per date specifiche:');
    
    for (const testDate of testDates) {
      console.log(`\n--- ${testDate} ---`);
      
      // Controlla prenotazioni per quella data
      const dayBookings = await sql`
        SELECT time, barber_id 
        FROM bookings 
        WHERE date = ${testDate}
      `;
      
      console.log(`Prenotazioni esistenti: ${dayBookings.length}`);
      dayBookings.forEach(booking => {
        console.log(`  - ${booking.time} (Barbiere ${booking.barber_id})`);
      });
      
      // Controlla giorno della settimana
      const date = new Date(testDate);
      const dayOfWeek = date.getDay(); // 0 = Domenica, 6 = Sabato
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      console.log(`Giorno della settimana: ${dayNames[dayOfWeek]} (${dayOfWeek})`);
      
      // Logica speciale per sabato
      if (dayOfWeek === 6) {
        console.log('⚠️ SABATO - Potrebbe avere orari diversi');
      }
    }
    
    // 6. Controlla API locale
    console.log('\n🌐 Test API locale /api/bookings/slots...');
    
    try {
      const apiUrl = 'http://localhost:3000/api/bookings/slots?date=2025-06-06&barberId=fabio';
      console.log(`Testando: ${apiUrl}`);
      console.log('(Nota: funziona solo se il server è avviato)');
    } catch (error) {
      console.log('❌ Server non disponibile per test API');
    }
    
  } catch (error) {
    console.error('💥 Errore durante debug:', error);
  }
}

debugSlots();
