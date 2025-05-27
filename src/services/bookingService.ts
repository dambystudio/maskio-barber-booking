import { Booking, TimeSlot } from '../types/booking';

const API_BASE = '/api/bookings';

export class BookingService {
  // Ottieni tutte le prenotazioni
  static async getBookings(): Promise<Booking[]> {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle prenotazioni');
      }
      return await response.json();
    } catch (error) {
      console.error('Errore nel caricamento delle prenotazioni:', error);
      throw error;
    }
  }

  // Crea una nuova prenotazione
  static async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella creazione della prenotazione');
      }

      return await response.json();
    } catch (error) {
      console.error('Errore nella creazione della prenotazione:', error);
      throw error;
    }
  }
  // Ottieni slot disponibili per una data e barbiere
  static async getAvailableSlots(date: string, barberId: string): Promise<TimeSlot[]> {
    try {
      const params = new URLSearchParams({ date, barberId });
      const response = await fetch(`${API_BASE}/slots?${params}`);
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento degli slot disponibili');
      }
      
      const timeSlots = await response.json();
      return timeSlots; // Now the API returns TimeSlot[] directly
    } catch (error) {
      console.error('Errore nel caricamento degli slot:', error);
      throw error;
    }
  }
}

// Utility per validare i dati della prenotazione
export const validateBookingData = (data: any): string[] => {
  const errors: string[] = [];

  if (!data.barberId) errors.push('Seleziona un barbiere');
  if (!data.date) errors.push('Seleziona una data');
  if (!data.time) errors.push('Seleziona un orario');
  if (!data.services || data.services.length === 0) errors.push('Seleziona almeno un servizio');
  
  if (!data.customerInfo) {
    errors.push('Inserisci i tuoi dati');
  } else {
    if (!data.customerInfo.name?.trim()) errors.push('Inserisci il nome');
    if (!data.customerInfo.email?.trim()) errors.push('Inserisci l\'email');
    if (!data.customerInfo.phone?.trim()) errors.push('Inserisci il telefono');
    
    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.customerInfo.email && !emailRegex.test(data.customerInfo.email)) {
      errors.push('Email non valida');
    }
  }

  return errors;
};
