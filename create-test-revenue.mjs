// Script per creare prenotazioni di test per giorni diversi
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/lib/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function createTestBookings() {
  try {
    console.log('🧪 Creazione prenotazioni di test...');
    
    // Data di oggi
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Data di domani 
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Data di ieri
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const testBookings = [
      // Oggi
      {
        customerName: 'Marco Rossi',
        customerEmail: 'marco.rossi@email.com',
        customerPhone: '+39 333 1234567',
        barberId: 'michele',
        barberName: 'Michele',
        service: 'Taglio Classico',
        price: '18.00',
        date: todayStr,
        time: '09:30',
        duration: 30,
        status: 'confirmed',
        notes: 'Cliente abituale'
      },
      {
        customerName: 'Luca Bianchi',
        customerEmail: 'luca.bianchi@email.com',
        customerPhone: '+39 333 7654321',
        barberId: 'fabio',
        barberName: 'Fabio',
        service: 'Taglio + Barba',
        price: '30.00',
        date: todayStr,
        time: '14:00',
        duration: 45,
        status: 'confirmed',
        notes: 'Taglio moderno'
      },
      // Domani
      {
        customerName: 'Andrea Verdi',
        customerEmail: 'andrea.verdi@email.com',
        customerPhone: '+39 333 1111111',
        barberId: 'michele',
        barberName: 'Michele',
        service: 'Rasatura Tradizionale',
        price: '15.00',
        date: tomorrowStr,
        time: '10:00',
        duration: 30,
        status: 'confirmed',
        notes: 'Prima volta'
      },
      {
        customerName: 'Giuseppe Neri',
        customerEmail: 'giuseppe.neri@email.com',
        customerPhone: '+39 333 2222222',
        barberId: 'fabio',
        barberName: 'Fabio',
        service: 'Trattamento Barba Premium',
        price: '35.00',
        date: tomorrowStr,
        time: '16:30',
        duration: 60,
        status: 'confirmed',
        notes: 'Trattamento completo'
      },
      // Ieri
      {
        customerName: 'Paolo Blu',
        customerEmail: 'paolo.blu@email.com',
        customerPhone: '+39 333 3333333',
        barberId: 'michele',
        barberName: 'Michele',
        service: 'Taglio Moderno',
        price: '22.00',
        date: yesterdayStr,
        time: '11:00',
        duration: 30,
        status: 'confirmed',
        notes: 'Stile hipster'
      }
    ];

    console.log(`📅 Creando prenotazioni per:`);
    console.log(`   Ieri (${yesterdayStr}): 1 prenotazione - €22.00`);
    console.log(`   Oggi (${todayStr}): 2 prenotazioni - €48.00`);
    console.log(`   Domani (${tomorrowStr}): 2 prenotazioni - €50.00`);

    for (const booking of testBookings) {
      const result = await db.insert(schema.bookings).values(booking).returning();
      console.log(`✅ Creata: ${booking.customerName} - ${booking.date} ${booking.time} - €${booking.price}`);
    }

    console.log('\n🎉 Prenotazioni di test create con successo!');
    console.log('\n💡 Ora puoi testare il pannello prenotazioni cambiando data per vedere i ricavi aggiornati');
    
  } catch (error) {
    console.error('❌ Errore nella creazione delle prenotazioni di test:', error);
  }
}

createTestBookings();
