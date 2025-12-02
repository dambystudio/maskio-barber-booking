// Script per prenotare tutti gli slot del 18 giugno 2025
const API_BASE = 'http://localhost:3000/api';

async function getAllBarbers() {
  try {
    const response = await fetch(`${API_BASE}/barbers`);
    return await response.json();
  } catch (error) {
    console.error('Errore ottenendo barbieri:', error);
    return [];
  }
}

async function getAllServices() {
  try {
    const response = await fetch(`${API_BASE}/services`);
    return await response.json();
  } catch (error) {
    console.error('Errore ottenendo servizi:', error);
    return [];
  }
}

async function createBooking(bookingData) {
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (error) {
    console.error('Errore creando prenotazione:', error);
    return null;
  }
}

async function bookAllSlotsForDate() {
  const date = '2025-06-18';
  console.log(`🔍 Prenotando tutti gli slot per il ${date}...`);
  
  // Ottieni barbieri e servizi
  const barbers = await getAllBarbers();
  const services = await getAllServices();
  
  console.log(`👨‍💼 Trovati ${barbers.length} barbieri`);
  console.log(`✂️ Trovati ${services.length} servizi`);
  
  if (barbers.length === 0 || services.length === 0) {
    console.error('❌ Nessun barbiere o servizio trovato');
    return;
  }
  
  // Orari disponibili (escluso pausa pranzo 12:00-14:00)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];
  
  let bookingCount = 0;
  let successCount = 0;
  
  for (const barber of barbers) {
    for (const timeSlot of timeSlots) {
      bookingCount++;
      
      const bookingData = {
        customerName: `Test Cliente ${bookingCount}`,
        customerEmail: `test${bookingCount}@example.com`,
        customerPhone: `+39 320 000 ${String(bookingCount).padStart(4, '0')}`,
        date: date,
        time: timeSlot,
        barberId: barber.id,
        serviceId: services[0].id, // Usa il primo servizio disponibile
        notes: `Prenotazione di test per slot ${timeSlot} - ${barber.name}`
      };
      
      console.log(`⏳ Prenotando slot ${timeSlot} con ${barber.name}...`);
      
      const result = await createBooking(bookingData);
      
      if (result) {
        successCount++;
        console.log(`✅ Prenotazione creata: ${bookingData.customerName} - ${timeSlot} con ${barber.name}`);
      } else {
        console.log(`❌ Fallita prenotazione per ${timeSlot} con ${barber.name}`);
      }
      
      // Piccola pausa per non sovraccaricare il server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`\n🎉 Completato! Tentate ${bookingCount} prenotazioni, ${successCount} riuscite per il ${date}`);
  console.log(`📅 Ora vai su http://localhost:3000/prenota e verifica che il 18 giugno appaia disabilitato!`);
}

// Esegui lo script
bookAllSlotsForDate();
