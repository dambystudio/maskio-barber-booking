// Test del tasto di annullamento nel pannello prenotazioni
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api';

async function testCancelBooking() {
  console.log('🧪 Test annullamento prenotazione dal pannello...\n');
  
  try {
    // Prima recuperiamo le prenotazioni esistenti
    console.log('1️⃣ Recupero prenotazioni esistenti...');
    const getResponse = await fetch(`${API_BASE}/bookings`);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      const bookings = data.bookings || [];
      
      console.log(`📋 Trovate ${bookings.length} prenotazioni`);
      
      if (bookings.length > 0) {
        // Trova una prenotazione confermata per testarla
        const confirmedBooking = bookings.find(b => b.status === 'confirmed');
        
        if (confirmedBooking) {
          console.log(`\n2️⃣ Test annullamento prenotazione ID: ${confirmedBooking.id}`);
          console.log(`   Cliente: ${confirmedBooking.customer_name}`);
          console.log(`   Status attuale: ${confirmedBooking.status}`);
          
          // Testa l'API PATCH per annullare
          const patchResponse = await fetch(`${API_BASE}/bookings`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: confirmedBooking.id,
              status: 'cancelled'
            }),
          });
          
          if (patchResponse.ok) {
            const updatedBooking = await patchResponse.json();
            console.log('✅ Annullamento riuscito!');
            console.log(`   Nuovo status: ${updatedBooking.status}`);
            
            // Verifica che sia stato effettivamente aggiornato
            const verifyResponse = await fetch(`${API_BASE}/bookings`);
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              const verifyBooking = verifyData.bookings.find(b => b.id === confirmedBooking.id);
              
              if (verifyBooking && verifyBooking.status === 'cancelled') {
                console.log('✅ Verifica: Status aggiornato correttamente nel database');
              } else {
                console.log('❌ Verifica: Status NON aggiornato nel database');
              }
            }
          } else {
            const error = await patchResponse.json();
            console.log('❌ Errore nell\'annullamento:', patchResponse.status);
            console.log('   Dettaglio errore:', error);
          }
        } else {
          console.log('⚠️  Nessuna prenotazione confermata trovata per il test');
          
          // Mostra tutte le prenotazioni per debugging
          console.log('\n📋 Prenotazioni disponibili:');
          bookings.forEach((booking, index) => {
            console.log(`   ${index + 1}. ID: ${booking.id} - ${booking.customer_name} - Status: ${booking.status}`);
          });
        }
      } else {
        console.log('⚠️  Nessuna prenotazione trovata. Creando una prenotazione di test...');
        
        // Crea una prenotazione di test
        const testBooking = {
          customerName: 'Test Cliente',
          customerEmail: 'test@example.com',
          customerPhone: '+39 333 1234567',
          barberId: 'fabio',
          barberName: 'Fabio',
          service: 'Taglio Uomo',
          price: 25,
          date: '2025-05-27',
          time: '10:00',
          duration: 30,
          status: 'confirmed',
          notes: 'Prenotazione di test per pannello'
        };
        
        const createResponse = await fetch(`${API_BASE}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testBooking),
        });
        
        if (createResponse.ok) {
          const newBooking = await createResponse.json();
          console.log('✅ Prenotazione di test creata:', newBooking.id);
          console.log('🔄 Rilanciare lo script per testare l\'annullamento');
        } else {
          console.log('❌ Errore nella creazione prenotazione di test');
        }
      }
    } else {
      console.log('❌ Errore nel recupero prenotazioni:', getResponse.status);
    }
  } catch (error) {
    console.error('💥 Errore nel test:', error);
  }
}

testCancelBooking();
