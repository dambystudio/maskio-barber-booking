// Local database fallback for development
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

interface LocalBooking {
  id: string;
  barberId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  date: string;
  time: string;
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  totalDuration: number;
  totalPrice: number;
  status?: string;
  createdAt: string;
}

export class LocalDatabaseService {
  static async createBooking(bookingData: any): Promise<LocalBooking> {
    // Read existing bookings
    let bookings: LocalBooking[] = [];
    
    try {
      if (fs.existsSync(BOOKINGS_FILE)) {
        const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        bookings = JSON.parse(data);
      }
    } catch (error) {
      console.log('Creating new bookings file...');
      bookings = [];
    }

    // Create new booking
    const newBooking: LocalBooking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      barberId: String(bookingData.barberId),
      customerInfo: {
        name: bookingData.customerName || bookingData.customerInfo?.name,
        email: bookingData.customerEmail || bookingData.customerInfo?.email,
        phone: bookingData.customerPhone || bookingData.customerInfo?.phone,
        notes: bookingData.notes || bookingData.customerInfo?.notes || '',
      },
      date: bookingData.date,
      time: bookingData.time,
      services: Array.isArray(bookingData.services) ? bookingData.services : [bookingData.services],
      totalDuration: bookingData.duration || bookingData.totalDuration || 30,
      totalPrice: bookingData.price || bookingData.totalPrice || 25,
      status: bookingData.status || 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Add to bookings array
    bookings.push(newBooking);

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Write back to file
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

    console.log('✅ Booking saved locally:', newBooking.id);

    return newBooking;
  }

  static async getBookingsByDate(date: string): Promise<LocalBooking[]> {
    try {
      if (!fs.existsSync(BOOKINGS_FILE)) {
        return [];
      }

      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      const bookings: LocalBooking[] = JSON.parse(data);
      
      return bookings.filter(booking => booking.date === date);
    } catch (error) {
      console.error('Error reading bookings:', error);
      return [];
    }
  }

  static async getBookingsByBarber(barberId: string, date?: string): Promise<LocalBooking[]> {
    try {
      if (!fs.existsSync(BOOKINGS_FILE)) {
        return [];
      }

      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      const bookings: LocalBooking[] = JSON.parse(data);
      
      let filtered = bookings.filter(booking => booking.barberId === String(barberId));
      
      if (date) {
        filtered = filtered.filter(booking => booking.date === date);
      }
      
      return filtered;
    } catch (error) {
      console.error('Error reading bookings:', error);
      return [];
    }
  }
}
