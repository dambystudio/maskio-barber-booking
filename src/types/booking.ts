export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

export interface Barber {
  id: string;
  name: string;
  specialties: string[];
  image: string;
  experience?: string;
  availableServices?: Service[]; // Made optional
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingData {
  service: string;
  barber: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export interface BookingFormData {
  selectedBarber: Barber | null;
  selectedService: Service | null; // MODIFICATO
  selectedDate: string;
  selectedTime: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
}

export interface BookingState {
  selectedBarber?: string;
  selectedServices: string[];
  selectedDate?: Date | null;
  selectedTime?: string;
}

export interface Booking {
  id: string;
  barberId: string;
  date: string;
  time: string;
  duration: number; // manteniamo per compatibilità
  totalDuration: number; // durata totale di tutti i servizi
  totalPrice: number; // prezzo totale di tutti i servizi
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  services: Service[];
  createdAt?: string;
}
