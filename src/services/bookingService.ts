import { Booking, TimeSlot } from '../types/booking';

const API_BASE = '/api/bookings';

export class BookingService {  // Ottieni tutte le prenotazioni
  static async getBookings(): Promise<Booking[]> {
    try {
      const response = await fetch(API_BASE, {
        credentials: 'include' // Include cookies for authentication
      });
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle prenotazioni');
      }
      return await response.json();
    } catch (error) {
      console.error('Errore nel caricamento delle prenotazioni:', error);
      throw error;
    }
  }  // Crea una nuova prenotazione
  static async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    try {
      console.log('📤 BookingService.createBooking called with:', bookingData);
      console.log('🌐 Making request to:', API_BASE);
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(bookingData),
      });

      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error data:', errorData);
        throw new Error(errorData.error || 'Errore nella creazione della prenotazione');
      }

      const result = await response.json();
      console.log('✅ API Success data:', result);
      return result;
    } catch (error) {
      console.error('💥 BookingService.createBooking error:', error);
      throw error;
    }
  }// Ottieni slot disponibili per una data e barbiere
  static async getAvailableSlots(date: string, barberId: string): Promise<TimeSlot[]> {
    try {
      const params = new URLSearchParams({ date, barberId });
      const response = await fetch(`${API_BASE}/slots?${params}`, {
        credentials: 'include' // Include cookies for authentication
      });
      
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

  // Ottieni disponibilità per multipli giorni in una sola chiamata (ottimizzato)
  static async getBatchAvailability(barberId: string, dates: string[]): Promise<Record<string, { hasSlots: boolean; availableCount: number; totalSlots: number }>> {
    try {
      console.log(`📊 BatchAvailability request for ${barberId}: ${dates.length} dates`);
      
      const response = await fetch(`${API_BASE}/batch-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          barberId,
          dates
        }),
      });
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento della disponibilità batch');
      }
      
      const result = await response.json();
      console.log(`✅ BatchAvailability completed: ${Object.keys(result.availability).length} dates processed`);
      return result.availability;
    } catch (error) {
      console.error('Errore nel caricamento della disponibilità batch:', error);
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
