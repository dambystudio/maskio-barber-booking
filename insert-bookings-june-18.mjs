import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carica le variabili d'ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Orari di lavoro del barbiere (09:00 - 19:00 con pausa pranzo 13:00-14:00)
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', 
  // Pausa pranzo dalle 13:00 alle 14:00
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
  '17:00', '17:30', '18:00', '18:30'
];

// Barbieri disponibili (ID reali dal database)
const barbers = [
  { id: 'fabio', name: 'Fabio' },
  { id: 'michele', name: 'Michele' }
];

async function insertAllBookingsForJune18() {
  try {
    console.log('🚀 Iniziando inserimento prenotazioni per il 18 giugno 2025...');
    
    let bookingCount = 0;
    
    // Per ogni barbiere
    for (const barber of barbers) {
      console.log(`\n📅 Prenotando tutti gli slot per ${barber.name}...`);
      
      // Per ogni slot orario
      for (const time of timeSlots) {
        const bookingData = {
          id: crypto.randomUUID(),
          customer_name: `Cliente Test ${bookingCount + 1}`,
          customer_email: `test${bookingCount + 1}@example.com`,
          customer_phone: `+39 123 456 ${String(bookingCount).padStart(4, '0')}`,
          barber_id: barber.id,
          barber_name: barber.name,
          service: 'Taglio Classico',
          price: '25.00',
          date: '2025-06-18',
          time: time,
          duration: 30,
          status: 'confirmed',
          notes: 'Prenotazione di test per verificare funzionalità giorni non disponibili',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Inserisci nel database
        await sql`
          INSERT INTO bookings (
            id, customer_name, customer_email, customer_phone, 
            barber_id, barber_name, service, price, date, time, 
            duration, status, notes, created_at, updated_at
          ) VALUES (
            ${bookingData.id}, ${bookingData.customer_name}, ${bookingData.customer_email}, 
            ${bookingData.customer_phone}, ${bookingData.barber_id}, ${bookingData.barber_name}, 
            ${bookingData.service}, ${bookingData.price}, ${bookingData.date}, ${bookingData.time}, 
            ${bookingData.duration}, ${bookingData.status}, ${bookingData.notes}, 
            ${bookingData.created_at}, ${bookingData.updated_at}
          )
        `;
        
        bookingCount++;
        console.log(`✅ Prenotato ${time} per ${barber.name}`);
      }
    }
    
    console.log(`\n🎉 Completato! Inserite ${bookingCount} prenotazioni per il 18 giugno 2025.`);
    console.log('\n📋 Riepilogo:');
    console.log(`- Data: 18 giugno 2025`);
    console.log(`- Barbieri: ${barbers.map(b => b.name).join(', ')}`);
    console.log(`- Slot per barbiere: ${timeSlots.length}`);
    console.log(`- Totale prenotazioni: ${bookingCount}`);
    console.log('\n🧪 Ora puoi testare la funzionalità:');
    console.log('1. Vai sulla pagina di prenotazione');
    console.log('2. Il 18 giugno dovrebbe apparire grigio/disabilitato');
    console.log('3. Cliccandoci dovrebbe dire "Nessun orario disponibile"');
    
  } catch (error) {
    console.error('❌ Errore durante l\'inserimento:', error);
  }
}

// Esegui lo script
insertAllBookingsForJune18();
