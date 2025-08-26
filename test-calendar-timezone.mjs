// Test script per verificare la generazione del calendario con il fuso orario corretto

// Copiamo la funzione direttamente qui per il test
const SERVICE_DURATIONS = {
  'Taglio': 30,
  'Barba': 15,
  'Taglio e Barba': 40,
  'Taglio + Barba': 40,
};

function generateICSFile(booking) {
  // Determina la durata del servizio
  const duration = SERVICE_DURATIONS[booking.service] || 30; // default 30 minuti
  
  // Crea date di inizio e fine usando il fuso orario locale italiano
  // Parsing della data e ora senza conversione UTC
  const [year, month, day] = booking.date.split('-').map(Number);
  const [hours, minutes] = booking.time.split(':').map(Number);
  
  // Crea la data nel fuso orario locale
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  
  // Formatta le date per il formato iCalendar senza conversione UTC
  // Usa il fuso orario Europe/Rome
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  // Genera l'ID univoco dell'evento
  const eventUID = `${booking.id}-${Date.now()}@maskiobarber.com`;
  
  // Crea il contenuto del file .ics con TIMEZONE
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Maskio Barber//Prenotazione//IT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VTIMEZONE
TZID:Europe/Rome
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:20070325T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:20071028T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:${eventUID}
DTSTAMP:${formatDateLocal(new Date())}Z
DTSTART;TZID=Europe/Rome:${formatDateLocal(startDate)}
DTEND;TZID=Europe/Rome:${formatDateLocal(endDate)}
SUMMARY:Appuntamento Maskio Barber - ${booking.service}
DESCRIPTION:🔸 Servizio: ${booking.service}\\n🔸 Barbiere: ${booking.barber}\\n🔸 Cliente: ${booking.customerName}${booking.notes ? `\\n🔸 Note: ${booking.notes}` : ''}\\n\\n📍 Maskio Barber\\nVia Sant'Agata 24\\nSan Giovanni Rotondo, 71013\\n\\n📞 Per modifiche o cancellazioni contattaci
LOCATION:Maskio Barber\\, Via Sant'Agata 24\\, San Giovanni Rotondo\\, 71013
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Promemoria: Appuntamento Maskio Barber domani alle ${booking.time} - ${booking.service} con ${booking.barber}
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Promemoria: Appuntamento Maskio Barber tra 1 ora - ${booking.service} con ${booking.barber}
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

// Test booking data
const testBooking = {
  id: 'test-123',
  customerName: 'Mario Rossi',
  service: 'Taglio',
  barber: 'Fabio',
  date: '2025-08-30', // Sabato
  time: '17:00',      // Dovrebbe rimanere 17:00, non diventare 19:00
  notes: 'Test timezone'
};

console.log('🧪 Testing calendar timezone fix...');
console.log(`Original time: ${testBooking.time} on ${testBooking.date}`);

const icsContent = generateICSFile(testBooking);

// Extract DTSTART and DTEND from the ICS content
const dtstartMatch = icsContent.match(/DTSTART;TZID=Europe\/Rome:(\d{8}T\d{6})/);
const dtendMatch = icsContent.match(/DTEND;TZID=Europe\/Rome:(\d{8}T\d{6})/);

if (dtstartMatch && dtendMatch) {
  const startTime = dtstartMatch[1];
  const endTime = dtendMatch[1];
  
  console.log(`📅 ICS DTSTART: ${startTime}`);
  console.log(`📅 ICS DTEND: ${endTime}`);
  
  // Parse the time from the ICS format
  const startHour = startTime.substring(9, 11);
  const startMinute = startTime.substring(11, 13);
  
  console.log(`⏰ Extracted start time: ${startHour}:${startMinute}`);
  
  if (`${startHour}:${startMinute}` === testBooking.time) {
    console.log('✅ SUCCESS: Time matches original booking time!');
  } else {
    console.log('❌ FAIL: Time does not match original booking time!');
  }
} else {
  console.log('❌ Could not extract times from ICS content');
}

// Show first part of ICS content for verification
console.log('\n📋 ICS Content Preview:');
console.log(icsContent.split('\n').slice(0, 20).join('\n'));
