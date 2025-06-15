import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import * as schema from './src/lib/schema';
import 'dotenv/config';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function bookAllSlotsForJune18() {
  try {
    console.log('🚀 Iniziando a prenotare tutti gli slot del 18 giugno 2025...');

    // Data del 18 giugno 2025
    const targetDate = '2025-06-18';

    // Ottieni tutti i barbieri
    const barbers = await db.select().from(schema.barbers);
    console.log(`📋 Trovati ${barbers.length} barbieri`);

    // Ottieni tutti i servizi
    const services = await db.select().from(schema.services);
    console.log(`✂️ Trovati ${services.length} servizi`);

    if (barbers.length === 0 || services.length === 0) {
      console.log('❌ Nessun barbiere o servizio trovato');
      return;
    }

    // Genera gli slot per il 18 giugno (dalle 9:00 alle 19:00, ogni 30 minuti)
    const timeSlots = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push(timeString);
      }
    }

    console.log(`⏰ Generati ${timeSlots.length} slot per il 18 giugno`);

    let bookingsCreated = 0;

    // Per ogni barbiere, prenota tutti gli slot
    for (const barber of barbers) {
      for (const timeSlot of timeSlots) {
        // Controlla se lo slot è già prenotato
        const existingBookings = await db.select().from(schema.bookings)
          .where(and(
            eq(schema.bookings.barberId, barber.id),
            eq(schema.bookings.date, targetDate),
            eq(schema.bookings.time, timeSlot)
          ));

        if (existingBookings.length === 0) {
          // Crea una prenotazione fittizia
          const [booking] = await db.insert(schema.bookings).values({
            customerName: `Test Customer ${bookingsCreated + 1}`,
            customerEmail: `test${bookingsCreated + 1}@example.com`,
            customerPhone: `+39 000 000 ${String(bookingsCreated + 1).padStart(4, '0')}`,
            barberId: barber.id,
            barberName: barber.name,
            service: services[0].name,
            price: services[0].price,
            date: targetDate,
            time: timeSlot,
            duration: services[0].duration,
            status: 'confirmed',
            notes: 'Prenotazione di test per il 18 giugno'
          }).returning();

          bookingsCreated++;
          console.log(`✅ Prenotazione creata: ${timeSlot} con ${barber.name}`);
        } else {
          console.log(`⚠️ Slot già prenotato: ${timeSlot} con ${barber.name}`);
        }
      }
    }

    console.log(`🎉 Completato! Create ${bookingsCreated} nuove prenotazioni per il 18 giugno`);
    console.log('📅 Il 18 giugno dovrebbe ora apparire come "tutto occupato" nel calendario');

  } catch (error) {
    console.error('❌ Errore durante la creazione delle prenotazioni:', error);
  }
}

bookAllSlotsForJune18();
