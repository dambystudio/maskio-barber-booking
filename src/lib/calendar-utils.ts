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
  
  // Crea date di inizio e fine
  const startDate = new Date(`${booking.date}T${booking.time}:00`);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  
  // Formatta le date per il formato iCalendar (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Genera l'ID univoco dell'evento
  const eventUID = `${booking.id}-${Date.now()}@maskiobarber.com`;
  
  // Crea il contenuto del file .ics
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Maskio Barber//Prenotazione//IT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${eventUID}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
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
