// Test del sistema di prenotazione autenticato
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAuthBooking() {
  console.log('🧪 Test sistema di prenotazione autenticato...\n');
  
  try {
    // 1. Test ottenimento barbieri
    console.log('1️⃣ Test API barbieri...');
    const barbersResponse = await fetch(`${BASE_URL}/api/barbers`);
    if (!barbersResponse.ok) {
      throw new Error(`Barbers API failed: ${barbersResponse.status}`);
    }
    const barbers = await barbersResponse.json();
    console.log(`✅ Trovati ${barbers.length} barbieri`);
    if (barbers.length === 0) {
      throw new Error('Nessun barbiere trovato');
    }
    const testBarber = barbers[0];
    console.log(`   Barbiere test: ${testBarber.name} (ID: ${testBarber.id})`);

    // 2. Test ottenimento servizi
    console.log('\n2️⃣ Test API servizi...');
    const servicesResponse = await fetch(`${BASE_URL}/api/services`);
    if (!servicesResponse.ok) {
      throw new Error(`Services API failed: ${servicesResponse.status}`);
    }
    const services = await servicesResponse.json();
    console.log(`✅ Trovati ${services.length} servizi`);
    if (services.length === 0) {
      throw new Error('Nessun servizio trovato');
    }
    const testService = services[0];
    console.log(`   Servizio test: ${testService.name} (ID: ${testService.id}, Prezzo: €${testService.price})`);

    // 3. Test disponibilità slot
    console.log('\n3️⃣ Test API slot disponibili...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    const slotsResponse = await fetch(`${BASE_URL}/api/bookings/slots?date=${testDate}&barberId=${testBarber.id}`);
    if (!slotsResponse.ok) {
      throw new Error(`Slots API failed: ${slotsResponse.status}`);
    }
    const slots = await slotsResponse.json();
    console.log(`✅ Trovati ${slots.length} slot per ${testDate}`);
    
    const availableSlot = slots.find(slot => slot.available);
    if (!availableSlot) {
      throw new Error('Nessuno slot disponibile trovato');
    }
    console.log(`   Slot test: ${availableSlot.time}`);

    // 4. Test creazione prenotazione (senza autenticazione - per vedere l'errore)
    console.log('\n4️⃣ Test creazione prenotazione senza autenticazione...');
    const bookingData = {
      userId: 'test-user-123',
      barberId: testBarber.id,
      serviceIds: [testService.id],
      customerInfo: {
        name: 'Mario Test',
        email: 'mario.test@example.com',
        phone: '+39 333 1234567',
        notes: 'Test prenotazione'
      },
      date: testDate,
      time: availableSlot.time,
      totalPrice: testService.price,
      totalDuration: testService.duration || 30
    };

    console.log('📋 Dati prenotazione:', JSON.stringify(bookingData, null, 2));

    const bookingResponse = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    console.log(`📱 Response status: ${bookingResponse.status}`);
    const responseData = await bookingResponse.json();
    console.log('📱 Response data:', JSON.stringify(responseData, null, 2));

    if (bookingResponse.ok) {
      console.log('✅ Prenotazione creata con successo!');
    } else {
      console.log('❌ Errore nella creazione prenotazione:', responseData.error);
    }

  } catch (error) {
    console.error('💥 Errore nel test:', error.message);
  }
}

testAuthBooking();
