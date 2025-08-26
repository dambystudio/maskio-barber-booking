// Utility per generare file iCalendar (.ics)

interface BookingCalendarData {
  id: string;
  customerName: string;
  service: string;
  barber: string;
  date: string; // "2025-08-26"
  time: string; // "14:30"
  notes?: string;
}

const SERVICE_DURATIONS: { [key: string]: number } = {
  'Taglio': 30,
  'Barba': 15,
  'Taglio e Barba': 40,
  'Taglio + Barba': 40,
  // Aggiungi altri servizi se necessario
};

export function generateICSFile(booking: BookingCalendarData): string {
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
  const formatDateLocal = (date: Date) => {
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

export function getServiceDuration(serviceName: string): number {
  return SERVICE_DURATIONS[serviceName] || 30;
}
