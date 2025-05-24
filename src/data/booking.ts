import { Service, Barber, TimeSlot } from '../types/booking';

// Servizi disponibili per Fabio
export const fabioServices: Service[] = [
  {
    id: 'taglio-fabio',
    name: 'Taglio',
    description: 'Taglio di capelli personalizzato',
    duration: 30,
    price: 18
  },
  {
    id: 'skincare-fabio',
    name: 'Skin Care',
    description: 'Trattamento cura viso',
    duration: 45,
    price: 30
  },
  {
    id: 'barba-fabio',
    name: 'Barba',
    description: 'Modellatura e contorno barba',
    duration: 15,
    price: 10
  },
  {
    id: 'taglio-barba-fabio',
    name: 'Taglio e Barba',
    description: 'Taglio di capelli (qualsiasi), contorno barba e modellatura della stessa',
    duration: 40,
    price: 23
  },
  {
    id: 'trattamento-barba-fabio',
    name: 'Trattamento Barba',
    description: 'Pulizia barba, modellatura, contorno e acconciatura',
    duration: 40,
    price: 25
  }
];

// Servizi disponibili per Michele
export const micheleServices: Service[] = [
  {
    id: 'taglio-michele',
    name: 'Taglio',
    description: 'Taglio di capelli personalizzato',
    duration: 30,
    price: 18
  },
  {
    id: 'barba-michele',
    name: 'Barba',
    description: 'Modellatura e contorno barba',
    duration: 15,
    price: 10
  },
  {
    id: 'taglio-barba-michele',
    name: 'Taglio e Barba',
    description: 'Taglio di capelli (qualsiasi), contorno barba e modellatura della stessa',
    duration: 40,
    price: 23
  },
  {
    id: 'skincare-michele',
    name: 'Skin Care',
    description: 'Trattamento cura viso',
    duration: 45,
    price: 30
  }
];

// Tutti i servizi per compatibilità
export const services: Service[] = [...fabioServices, ...micheleServices];

export const barbers: Barber[] = [
  {
    id: 'fabio',
    name: 'Fabio',
    image: '/barbers/fabio.jpg',
    specialties: ['Tagli classici', 'Skin Care', 'Trattamenti barba'],
    experience: '8 anni di esperienza',
    availableServices: fabioServices
  },
  {
    id: 'michele',
    name: 'Michele',
    image: '/barbers/michele.jpg',
    specialties: ['Tagli moderni', 'Barba', 'Skin Care'],
    experience: '6 anni di esperienza',
    availableServices: micheleServices
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
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split('T')[0];
  
  // Domenica chiuso
  if (dayOfWeek === 0) {
    return slots;
  }
  
  // Slot mattina: 9:00-12:30 (incluso 12:30)
  for (let hour = 9; hour <= 12; hour++) {
    const maxMinute = hour === 12 ? 30 : 60; // Solo fino a 12:30
    for (let minute = 0; minute < maxMinute; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const available = isTimeSlotAvailable(dateString, timeString, barberId);
      
      slots.push({
        time: timeString,
        available
      });
    }
  }
  
  // Slot pomeriggio: 15:00-17:30 (incluso 17:30)
  for (let hour = 15; hour <= 17; hour++) {
    const maxMinute = hour === 17 ? 30 : 60; // Solo fino a 17:30
    for (let minute = 0; minute < maxMinute; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const available = isTimeSlotAvailable(dateString, timeString, barberId);
      
      slots.push({
        time: timeString,
        available
      });
    }
  }
  
  return slots;
};

// Verifica se uno slot temporale è disponibile
const isTimeSlotAvailable = (date: string, time: string, barberId?: string): boolean => {
  if (!barberId) return true;
  
  // Controlla se c'è già una prenotazione per questo barbiere in questo momento
  const existingBooking = existingBookings.find(booking => 
    booking.barberId === barberId && 
    booking.date === date && 
    isTimeConflict(booking.time, booking.duration, time)
  );
  
  return !existingBooking;
};

// Verifica se c'è un conflitto di orario
const isTimeConflict = (bookedTime: string, bookedDuration: number, requestedTime: string): boolean => {
  const bookedStart = timeToMinutes(bookedTime);
  const bookedEnd = bookedStart + bookedDuration;
  const requestedStart = timeToMinutes(requestedTime);
  const requestedEnd = requestedStart + 30; // Slot da 30 minuti
  
  // C'è conflitto se gli orari si sovrappongono
  return (requestedStart < bookedEnd && requestedEnd > bookedStart);
};

// Converte l'orario in minuti per facilitare i calcoli
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

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