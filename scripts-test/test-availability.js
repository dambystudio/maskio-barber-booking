// Test della logica di disponibilità slot
const fs = require('fs');
const path = require('path');

// Simula la funzione di lettura del file JSON
async function getBookingsFromFile() {
  try {
    const filePath = path.join(__dirname, 'data', 'bookings.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Errore nella lettura del file:', error);
    return [];
  }
}

// Converte l'orario in minuti per facilitare i calcoli
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Verifica se c'è un conflitto di orario
function isTimeConflict(bookedTime, bookedDuration, requestedTime) {
  const bookedStart = timeToMinutes(bookedTime);
  const bookedEnd = bookedStart + bookedDuration;
  const requestedStart = timeToMinutes(requestedTime);
  const requestedEnd = requestedStart + 30;
  
  const hasConflict = (requestedStart < bookedEnd && requestedEnd > bookedStart);
  
  console.log(`🕒 Controllo conflitto orario:`, {
    bookedTime,
    bookedDuration,
    bookedStart,
    bookedEnd,
    requestedTime,
    requestedStart,
    requestedEnd,
    hasConflict
  });
  
  return hasConflict;
}

// Verifica se uno slot temporale è disponibile
function isTimeSlotAvailable(existingBookings, date, time, barberId) {
  console.log(`🔍 Controllo disponibilità per barbiere ${barberId} il ${date} alle ${time}`);
  console.log(`📋 Prenotazioni esistenti per la data:`, existingBookings.length);
  
  const existingBooking = existingBookings.find(booking => {
    // Usa sia duration che totalDuration per compatibilità
    const duration = booking.duration || booking.totalDuration || 30;
    const isConflict = booking.barberId === barberId && 
                      booking.date === date && 
                      isTimeConflict(booking.time, duration, time);
    
    if (isConflict) {
      console.log(`❌ Conflitto trovato:`, {
        bookingBarberId: booking.barberId,
        bookingDate: booking.date, 
        bookingTime: booking.time,
        bookingDuration: duration,
        requestedTime: time
      });
    }
    
    return isConflict;
  });
  
  const available = !existingBooking;
  console.log(`✅ Slot ${time} disponibile: ${available}`);
  return available;
}

async function testAvailability() {
  console.log('🧪 Test logica di disponibilità slot...\n');
  
  const allBookings = await getBookingsFromFile();
  console.log(`📚 Totale prenotazioni caricate: ${allBookings.length}\n`);
  
  // Test con data 2025-05-26 e barbiere "1"
  const testDate = '2025-05-26';
  const testBarberId = '1';
  
  // Filtra prenotazioni per la data
  const dayBookings = allBookings.filter(booking => booking.date === testDate);
  console.log(`📅 Prenotazioni per ${testDate}:`, dayBookings.length);
  
  dayBookings.forEach(booking => {
    console.log(`  - Barbiere ${booking.barberId}: ${booking.time} (durata: ${booking.duration || booking.totalDuration || 'N/A'})`);
  });
  
  console.log('\n🔍 Test disponibilità orari...');
  
  // Test alcuni orari specifici
  const testTimes = ['09:00', '10:00', '11:00', '12:30', '15:00', '17:30'];
  
  testTimes.forEach(time => {
    console.log(`\n--- Test orario ${time} ---`);
    const available = isTimeSlotAvailable(dayBookings, testDate, time, testBarberId);
    console.log(`Risultato: ${available ? 'DISPONIBILE' : 'OCCUPATO'}`);
  });
}

testAvailability().catch(console.error);
