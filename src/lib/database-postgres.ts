// Database Layer - PostgreSQL with Neon
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, desc, asc } from 'drizzle-orm';
import * as schema from './schema';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export interface BookingWithDetails extends schema.Booking {
  // Add any additional fields for joins if needed
}

export class DatabaseService {
  // === USER MANAGEMENT ===
  
  static async createUser(userData: schema.NewUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values(userData).returning();
    return newUser;
  }
  
  static async getUserById(userId: string): Promise<schema.User | null> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    return users[0] || null;
  }
    static async getUserByEmail(email: string): Promise<schema.User | null> {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return users[0] || null;
  }
  
  static async getUserByPhone(phone: string): Promise<schema.User | null> {
    const users = await db.select().from(schema.users).where(eq(schema.users.phone, phone));
    return users[0] || null;
  }
  
  static async getAllUsers(): Promise<schema.User[]> {
    return await db.select().from(schema.users).orderBy(asc(schema.users.createdAt));
  }

  static async updateUser(userId: string, updates: Partial<schema.NewUser>): Promise<schema.User | null> {
    const [updatedUser] = await db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, userId))
      .returning();
    return updatedUser || null;
  }
  static async deleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, userId));
    return result.rowCount > 0;
  }

  // === SERVICE MANAGEMENT ===
  
  static async getServices(): Promise<schema.Service[]> {
    return await db.select().from(schema.services).orderBy(asc(schema.services.name));
  }

  static async getServiceById(serviceId: string): Promise<schema.Service | null> {
    const services = await db.select().from(schema.services).where(eq(schema.services.id, serviceId));
    return services[0] || null;
  }

  // === BARBER MANAGEMENT ===
  
  static async getBarbers(): Promise<schema.Barber[]> {
    return await db.select().from(schema.barbers).orderBy(asc(schema.barbers.name));
  }

  static async getBarberById(barberId: string): Promise<schema.Barber | null> {
    const barbers = await db.select().from(schema.barbers).where(eq(schema.barbers.id, barberId));
    return barbers[0] || null;
  }

  // === BOOKING MANAGEMENT ===
  
  static async createBooking(bookingData: schema.NewBooking): Promise<schema.Booking> {
    const [newBooking] = await db.insert(schema.bookings).values({
      ...bookingData,
      updatedAt: new Date(),
    }).returning();
    return newBooking;
  }

  static async getBookingById(bookingId: string): Promise<schema.Booking | null> {
    const bookings = await db.select().from(schema.bookings).where(eq(schema.bookings.id, bookingId));
    return bookings[0] || null;
  }

  static async getAllBookings(): Promise<schema.Booking[]> {
    // Ottimizzazione: Limita ai prossimi 90 giorni per ridurre carico CPU
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateLimit = ninetyDaysAgo.toISOString().split('T')[0];
    
    const result = await sql`
      SELECT * FROM bookings 
      WHERE date >= ${dateLimit}
      ORDER BY created_at DESC
      LIMIT 2000
    `;
    return result as schema.Booking[];
  }

  static async getBookingsByUser(userId: string): Promise<schema.Booking[]> {
    return await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.userId, userId))
      .orderBy(desc(schema.bookings.createdAt));
  }

  static async getBookingsByBarber(barberId: string): Promise<schema.Booking[]> {
    return await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.barberId, barberId))
      .orderBy(desc(schema.bookings.createdAt));
  }

  static async getBookingsByDate(date: string): Promise<schema.Booking[]> {
    return await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.date, date))
      .orderBy(asc(schema.bookings.time));
  }  static async getBookingsByDateRange(startDate: string, endDate: string): Promise<schema.Booking[]> {
    return await db
      .select()
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.date, startDate), // This would need proper date range query
      ))
      .orderBy(asc(schema.bookings.date), asc(schema.bookings.time));
  }

  // Search bookings by customer name (case-insensitive, partial match)
  static async searchBookingsByCustomer(customerName: string): Promise<any[]> {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    
    // Simple query - bookings table already has all needed fields
    const result = await sql`
      SELECT 
        id,
        date as booking_date,
        time as booking_time,
        customer_name,
        customer_phone,
        customer_email,
        status,
        notes,
        created_at,
        service as service_name,
        barber_name,
        barber_id
      FROM bookings
      WHERE LOWER(customer_name) LIKE LOWER(${'%' + customerName + '%'})
      ORDER BY date DESC, time DESC
      LIMIT 100
    `;
    
    return result;
  }

  static async updateBooking(bookingId: string, updates: Partial<schema.NewBooking>): Promise<schema.Booking | null> {
    const [updatedBooking] = await db
      .update(schema.bookings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.bookings.id, bookingId))
      .returning();
    return updatedBooking || null;
  }

  static async updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<schema.Booking | null> {
    return await this.updateBooking(bookingId, { status });
  }

  static async deleteBooking(bookingId: string): Promise<boolean> {
    const result = await db.delete(schema.bookings).where(eq(schema.bookings.id, bookingId));
    return result.rowCount > 0;
  }

  static async deleteAllBookings(): Promise<void> {
    await db.delete(schema.bookings);
  }

  // === BARBER MANAGEMENT ===

  static async createBarber(barberData: schema.NewBarber): Promise<schema.Barber> {
    const [newBarber] = await db.insert(schema.barbers).values(barberData).returning();
    return newBarber;
  }

  static async getAllBarbers(): Promise<schema.Barber[]> {
    return await db
      .select()
      .from(schema.barbers)
      .where(eq(schema.barbers.isActive, true))
      .orderBy(asc(schema.barbers.name));  }

  static async updateBarber(barberId: string, updates: Partial<schema.NewBarber>): Promise<schema.Barber | null> {
    const [updatedBarber] = await db
      .update(schema.barbers)
      .set(updates)
      .where(eq(schema.barbers.id, barberId))
      .returning();
    return updatedBarber || null;
  }

  // === BARBER SCHEDULE MANAGEMENT ===

  static async getBarberSchedule(barberId: string, date: string): Promise<schema.BarberSchedule | null> {
    const schedules = await db
      .select()
      .from(schema.barberSchedules)
      .where(and(
        eq(schema.barberSchedules.barberId, barberId),
        eq(schema.barberSchedules.date, date)
      ));
    return schedules[0] || null;
  }

  static async setBarberSchedule(scheduleData: schema.NewBarberSchedule): Promise<schema.BarberSchedule> {
    // Check if schedule already exists
    const existing = await this.getBarberSchedule(scheduleData.barberId!, scheduleData.date);
    
    if (existing) {
      // Update existing schedule
      const [updated] = await db
        .update(schema.barberSchedules)
        .set({
          ...scheduleData,
          updatedAt: new Date(),
        })
        .where(eq(schema.barberSchedules.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new schedule
      const [newSchedule] = await db
        .insert(schema.barberSchedules)
        .values({
          ...scheduleData,
          updatedAt: new Date(),
        })
        .returning();
      return newSchedule;
    }
  }

  static async getAvailableSlots(barberId: string, date: string): Promise<string[]> {
    const schedule = await this.getBarberSchedule(barberId, date);
    
    let availableSlots: string[] = [];
    
    if (schedule && !schedule.dayOff) {
      // Se esiste un record specifico per questa data, usalo
      try {
        availableSlots = schedule.availableSlots ? JSON.parse(schedule.availableSlots) : [];
        const unavailableSlots = schedule.unavailableSlots ? JSON.parse(schedule.unavailableSlots) : [];
        
        // Rimuovi gli slot non disponibili
        availableSlots = availableSlots.filter((slot: string) => !unavailableSlots.includes(slot));
      } catch (error) {
        console.error('Error parsing schedule slots:', error);
        availableSlots = [];
      }
    } else if (!schedule || (schedule && !schedule.dayOff)) {
      // Se non esiste un record specifico o il giorno non è marcato come libero,
      // genera gli slot standard basandosi sugli orari di lavoro
      availableSlots = this.generateStandardSlots(date);
    } else {
      // Il giorno è marcato come libero
      return [];
    }

    // Get booked slots for this date and barber
    const bookings = await this.getBookingsByDate(date);
    const bookedSlots = bookings
      .filter(booking => booking.barberId === barberId && booking.status !== 'cancelled')
      .map(booking => booking.time);

    // Return available slots minus booked slots
    return availableSlots.filter((slot: string) => !bookedSlots.includes(slot));
  }

  // Nuova funzione per generare gli slot standard
  private static generateStandardSlots(dateString: string): string[] {
    const slots: string[] = [];
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    
    // Skip domenica (0) - giorno di chiusura standard
    if (dayOfWeek === 0) {
      return slots;
    }

    // Monday (1) - Half day: only afternoon 15:00-17:30
    if (dayOfWeek === 1) {
      // Only afternoon slots 15:00-17:30 for Monday
      for (let hour = 15; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 17 && minute > 30) break;
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
      return slots;
    }

    // Saturday has modified hours (9:00-12:30, 14:30-17:00)
    if (dayOfWeek === 6) {
      // Morning slots 9:00-12:30
      for (let hour = 9; hour <= 12; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 12 && minute > 30) break;
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
      
      // Afternoon slots 14:30-17:00 (aggiunto 14:30, rimosso 17:30)
      slots.push('14:30'); // Nuovo orario aggiunto
      for (let hour = 15; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 17 && minute > 0) break; // Stop at 17:00 (no 17:30)
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
      return slots;
    }

    // Tuesday-Friday: Morning slots 9:00-12:30
    for (let hour = 9; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 12 && minute > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    // Tuesday-Friday: Afternoon slots 15:00-17:30
    for (let hour = 15; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    return slots;
  }

  // === SERVICES MANAGEMENT ===

  static async createService(serviceData: schema.NewService): Promise<schema.Service> {
    const [newService] = await db.insert(schema.services).values(serviceData).returning();
    return newService;
  }

  static async getAllServices(): Promise<schema.Service[]> {
    return await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.isActive, true))
      .orderBy(asc(schema.services.name));  }

  // === STATISTICS ===

  static async getBookingStats(startDate?: string, endDate?: string) {
    // This would need more complex queries for date ranges
    const totalBookings = await db.select().from(schema.bookings);
    
    return {
      totalBookings: totalBookings.length,
      confirmedBookings: totalBookings.filter(b => b.status === 'confirmed').length,
      pendingBookings: totalBookings.filter(b => b.status === 'pending').length,
      cancelledBookings: totalBookings.filter(b => b.status === 'cancelled').length,
      completedBookings: totalBookings.filter(b => b.status === 'completed').length,
      totalRevenue: totalBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.price.toString()), 0),
    };
  }

  // === UTILITY METHODS ===

  static async checkSlotAvailability(barberId: string, date: string, time: string): Promise<boolean> {
    const availableSlots = await this.getAvailableSlots(barberId, date);
    return availableSlots.includes(time);
  }

  static async getUpcomingBookings(userId?: string): Promise<schema.Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    
    if (userId) {
      return await db
        .select()
        .from(schema.bookings)
        .where(and(
          eq(schema.bookings.userId, userId),
          eq(schema.bookings.date, today) // This would need proper date comparison
        ))
        .orderBy(asc(schema.bookings.date), asc(schema.bookings.time));
    }

    return await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.date, today)) // This would need proper date comparison
      .orderBy(asc(schema.bookings.date), asc(schema.bookings.time));
  }
}

// Export database instance for direct queries if needed
export { schema };
