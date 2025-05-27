// Script diretto per eliminare tutte le prenotazioni
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/lib/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function deleteAllBookings() {
  try {
    console.log('🗑️ Eliminazione di tutte le prenotazioni...');
    
    // Prima conta le prenotazioni esistenti
    const existingBookings = await db.select().from(schema.bookings);
    const totalBookings = existingBookings.length;
    
    console.log(`📊 Trovate ${totalBookings} prenotazioni da eliminare:`);
    
    // Mostra le prenotazioni che verranno eliminate
    existingBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.customerName} - ${booking.date} ${booking.time} (${booking.status})`);
    });
    
    if (totalBookings === 0) {
      console.log('✅ Nessuna prenotazione da eliminare');
      return;
    }
    
    // Elimina tutte le prenotazioni
    await db.delete(schema.bookings);
    
    console.log(`✅ Eliminate con successo ${totalBookings} prenotazioni!`);
    
    // Verifica l'eliminazione
    const remainingBookings = await db.select().from(schema.bookings);
    
    if (remainingBookings.length === 0) {
      console.log('✅ Verifica completata: tutte le prenotazioni sono state eliminate');
    } else {
      console.log(`⚠️ Attenzione: rimangono ancora ${remainingBookings.length} prenotazioni`);
    }
    
  } catch (error) {
    console.error('❌ Errore durante l\'eliminazione delle prenotazioni:', error);
  }
}

// Esegui l'eliminazione
deleteAllBookings();
