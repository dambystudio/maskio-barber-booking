import { Service, Barber, TimeSlot } from '../types/booking';

// Definizione corretta dei servizi come da ultima richiesta
export const fabioSpecificServices: Service[] = [
  { id: 'taglio', name: 'Taglio', description: 'Taglio di capelli personalizzato', duration: 30, price: 18 },
  { id: 'barba', name: 'Barba', description: 'Modellatura e contorno barba', duration: 15, price: 10 },
  { id: 'taglio-e-barba', name: 'Taglio e Barba', description: 'Taglio capelli e sistemazione barba', duration: 40, price: 23 },
  { id: 'skincare', name: 'Skincare', description: 'Trattamento cura viso', duration: 45, price: 30 },
  { id: 'trattamento-barba', name: 'Trattamento Barba', description: 'Pulizia barba, modellatura, contorno e acconciatura', duration: 40, price: 25 }
];

export const micheleSpecificServices: Service[] = [
  { id: 'taglio', name: 'Taglio', description: 'Taglio di capelli personalizzato', duration: 30, price: 18 },
  { id: 'barba', name: 'Barba', description: 'Modellatura e contorno barba', duration: 15, price: 10 },
  { id: 'taglio-e-barba', name: 'Taglio e Barba', description: 'Taglio capelli e sistemazione barba', duration: 40, price: 23 },
  { id: 'skincare', name: 'Skincare', description: 'Trattamento cura viso', duration: 45, price: 30 }
];

export const barbersFromData: Barber[] = [
  {
    id: 'fabio', // Questo ID deve corrispondere a quello nel database se si fa matching
    name: 'Fabio',
    image: '/barbers/fabio.jpg',
    specialties: ['Tagli classici', 'Skin Care', 'Trattamenti barba'],
    experience: '8 anni di esperienza',
    availableServices: fabioSpecificServices // Assegnazione per la pagina /servizi
  },
  {
    id: 'michele', // Questo ID deve corrispondere a quello nel database se si fa matching
    name: 'Michele',
    image: '/barbers/michele.jpg',
    specialties: ['Tagli moderni', 'Barba', 'Skin Care'],
    experience: '6 anni di esperienza',
    availableServices: micheleSpecificServices // Assegnazione per la pagina /servizi
  }
];

// Struttura per memorizzare le prenotazioni
interface Booking {
  id: string;
  barberId: string;
  date: string;
  time: string;
  duration: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

// Simulazione database delle prenotazioni in memoria
let existingBookings: Booking[] = [];

// Funzione per aggiungere una prenotazione
export const addBooking = (booking: Booking) => {
  existingBookings.push(booking);
};

// Funzione per ottenere le prenotazioni esistenti
export const getBookings = () => existingBookings;

// Genera gli slot temporali disponibili
export const generateTimeSlots = (date: Date, barberId?: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayOfWeek = date.getUTCDay(); // Use UTC to avoid timezone issues
  
  // Format date string manually to avoid timezone issues
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  // Domenica chiuso
  if (dayOfWeek === 0) {
    return slots;
  }// Slot mattina: 9:00-12:30 (incluso 12:30)
  for (let hour = 9; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Stop at 12:30 for the last morning slot
      if (hour === 12 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      // La logica di isTimeSlotAvailable qui sotto è una simulazione e dovrebbe
      // essere sostituita da chiamate API reali se questo file è ancora usato per la logica di slot.
      // const available = isTimeSlotAvailable(dateString, timeString, barberId); 
      slots.push({
        time: timeString,
        available: true // Placeholder: la disponibilità reale viene dall'API
      });
    }
  }
  
  // Slot pomeriggio: 15:00-17:30 (incluso 17:30)
  for (let hour = 15; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Stop at 17:30 for the last afternoon slot
      if (hour === 17 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      // const available = isTimeSlotAvailable(dateString, timeString, barberId);
      slots.push({
        time: timeString,
        available: true // Placeholder
      });
    }
  }
  
  return slots;
};

// La funzione isTimeSlotAvailable e le sue dipendenze (come existingBookings)
// sono probabilmente obsolete se la logica è centralizzata nel backend.
// Considerare la rimozione se non sono più utilizzate.
function isTimeSlotAvailable(date: string, time: string, barberId?: string): boolean {
  if (!barberId) return true; // Se non c'è barbiere, consideralo disponibile (logica da rivedere)
  return !existingBookings.some(booking => 
    booking.barberId === barberId && 
    booking.date === date && 
    booking.time === time 
  );
}

export const isDateAvailable = (date: Date): boolean => {
  const today = new Date();
  const dayOfWeek = date.getDay();
  
  // Non può prenotare nel passato
  if (date < today) {
    return false;
  }
  
  // Domenica chiuso
  if (dayOfWeek === 0) {
    return false;
  }
  
  return true;
};