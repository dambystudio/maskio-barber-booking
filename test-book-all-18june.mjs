import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { bookings, barbers, services } from './src/lib/drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

// Configurazione del database
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function createTestBookingsFor18June() {
  console.log('🔍 Creando prenotazioni di test per il 18 giugno 2025...');
  
  try {
    // Trova tutti i barbieri
    const allBarbers = await db.select().from(barbers);
    console.log(`👨‍💼 Trovati ${allBarbers.length} barbieri:`, allBarbers.map(b => b.name));
    
    // Trova tutti i servizi
    const allServices = await db.select().from(services);
    console.log(`✂️ Trovati ${allServices.length} servizi:`, allServices.map(s => s.name));
    
    if (allBarbers.length === 0 || allServices.length === 0) {
      console.error('❌ Nessun barbiere o servizio trovato!');
      return;
    }
    
    // Orari disponibili (escluso pausa pranzo)
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];
    
    const targetDate = '2025-06-18';
    let bookingCount = 0;
    
    // Per ogni barbiere, crea prenotazioni per tutti gli slot
    for (const barber of allBarbers) {
      for (const timeSlot of timeSlots) {
        
        // Controlla se esiste già una prenotazione per questo slot
        const existingBooking = await db.select()
          .from(bookings)
          .where(
            and(
              eq(bookings.date, targetDate),
              eq(bookings.time, timeSlot),
              eq(bookings.barberId, barber.id)
            )
          )
          .limit(1);
        
        if (existingBooking.length > 0) {
          console.log(`⏭️  Slot ${timeSlot} con ${barber.name} già occupato`);
          continue;
        }
        
        bookingCount++;
        
        const bookingData = {
          customerName: `Test Cliente ${bookingCount}`,
          customerEmail: `test${bookingCount}@example.com`,
          customerPhone: `+39 320 000 ${String(bookingCount).padStart(4, '0')}`,
          date: targetDate,
          time: timeSlot,
          barberId: barber.id,
          serviceId: allServices[0].id, // Usa il primo servizio
          notes: `Prenotazione di test per rendere non disponibile il ${targetDate}`,
          status: 'confirmed',
          createdAt: new Date()
        };
        
        try {
          await db.insert(bookings).values(bookingData);
          console.log(`✅ Creata prenotazione: ${timeSlot} con ${barber.name}`);
        } catch (error) {
          console.log(`❌ Errore creando prenotazione ${timeSlot} con ${barber.name}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Completato! Create ${bookingCount} prenotazioni per il ${targetDate}`);
    
    // Verifica il totale delle prenotazioni
    const totalBookings = await db.select()
      .from(bookings)
      .where(eq(bookings.date, targetDate));
    
    console.log(`📊 Totale prenotazioni per il ${targetDate}: ${totalBookings.length}`);
    console.log(`\n📅 Ora vai su http://localhost:3000/prenota e verifica che il 18 giugno appaia disabilitato e in rosso!`);
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

// Esegui lo script
createTestBookingsFor18June();
