// Script per eliminare tutte le prenotazioni tramite API
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:3000'; // Assicurati che il server sia in esecuzione

async function deleteAllBookings() {
  try {
    console.log('🔍 Recupero tutte le prenotazioni esistenti...');
    
    // Ottieni tutte le prenotazioni
    const response = await fetch(`${BASE_URL}/api/bookings`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const bookings = data.bookings || [];
    
    console.log(`📊 Trovate ${bookings.length} prenotazioni da eliminare`);
    
    if (bookings.length === 0) {
      console.log('✅ Nessuna prenotazione da eliminare');
      return;
    }
    
    // Elimina ogni prenotazione una per una
    let deletedCount = 0;
    for (const booking of bookings) {
      try {
        const deleteResponse = await fetch(`${BASE_URL}/api/bookings?id=${booking.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Eliminata prenotazione: ${booking.customer_name} - ${booking.booking_date} ${booking.booking_time}`);
          deletedCount++;
        } else {
          console.log(`❌ Errore nell'eliminazione della prenotazione ${booking.id}: ${deleteResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Errore nell'eliminazione della prenotazione ${booking.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Operazione completata! Eliminate ${deletedCount}/${bookings.length} prenotazioni`);
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
    console.log('\n💡 Assicurati che il server Next.js sia in esecuzione su localhost:3000');
  }
}

deleteAllBookings();
