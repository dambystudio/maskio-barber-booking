import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-postgres';
import { EmailService } from '@/lib/email';
import { Booking } from '@/lib/schema';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Rate limiting per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || userLimit.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function GET(request: NextRequest) {  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Devi essere loggato per visualizzare le prenotazioni' },
        { status: 401 }
      );
    }

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check user permissions
    const userRole = session.user.role;
    const userEmail = session.user.email;

    // Get query parameters for filtering
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const barberId = url.searchParams.get('barberId');
    const barberEmail = url.searchParams.get('barberEmail');
    const status = url.searchParams.get('status');
    const userId = url.searchParams.get('userId');
    const fetchAll = url.searchParams.get('fetchAll'); // <-- NUOVO

    let bookings: Booking[] = [];

    // <-- NUOVA LOGICA per fetchAll -->
    if (fetchAll === 'true') {
        if (userRole === 'admin') {
            bookings = await DatabaseService.getAllBookings();
        } else if (userRole === 'barber') {
            const allBarbers = await DatabaseService.getBarbers();
            const currentBarber = allBarbers.find(b => b.email === userEmail);
            if (!currentBarber) {
                return NextResponse.json({ error: 'Barbiere non trovato' }, { status: 404 });
            }
            bookings = await DatabaseService.getBookingsByBarber(currentBarber.id);
        } else { // Customer
            bookings = await DatabaseService.getBookingsByUser(session.user.id);
        }
        
        // Applica filtro per status se presente, anche in modalità fetchAll
        if (status && status !== 'all') {
            bookings = bookings.filter(booking => booking.status === status);
        }

    } else { // <-- LOGICA ESISTENTE -->
        // If user is a barber (not admin), they can see their own bookings or other barbers' bookings
        if (userRole === 'barber') {
          const allBarbers = await DatabaseService.getBarbers();
          
          // If barberEmail is specified, show that barber's bookings (for viewing other barbers)
          if (barberEmail) {
            const targetBarber = allBarbers.find(b => b.email === barberEmail);
            if (!targetBarber) {
              return NextResponse.json(
                { error: 'Barbiere non trovato' },
                { status: 404 }
              );
            }
            bookings = await DatabaseService.getBookingsByBarber(targetBarber.id);
          } else {
            // Default: show current barber's own bookings
            const currentBarber = allBarbers.find(b => b.email === userEmail);
            if (!currentBarber) {
              return NextResponse.json(
                { error: 'Barbiere corrente non trovato' },
                { status: 404 }
              );
            }
            bookings = await DatabaseService.getBookingsByBarber(currentBarber.id);
          }
          
          // Apply additional filters if specified
          if (date) {
            bookings = bookings.filter(booking => booking.date === date);
          }
          if (status && status !== 'all') {
            bookings = bookings.filter(booking => booking.status === status);
          }
        } 
        // If user is admin, allow filtering by parameters
        else if (userRole === 'admin') {
          if (userId) {
            bookings = await DatabaseService.getBookingsByUser(userId);
          } else if (date) {
            bookings = await DatabaseService.getBookingsByDate(date);    
          } else if (barberId) {
            bookings = await DatabaseService.getBookingsByBarber(barberId);
          } else {
            // Get all bookings for admin panel
            bookings = await DatabaseService.getAllBookings();
          }

          // Apply additional filters for admin
          if (userId) {
            bookings = bookings.filter(booking => booking.userId === userId);
          }
            // Filter by barber email if specified
          if (barberEmail) {
            // Get all barbers and find by email
            const allBarbers = await DatabaseService.getBarbers();
            const barber = allBarbers.find(b => b.email === barberEmail);
            if (barber) {
              bookings = bookings.filter(booking => booking.barberId === barber.id);
            } else {
              // If barber not found, return empty array
              bookings = [];
            }
          }
          
          // Filter by status if specified
          if (status && status !== 'all') {
            bookings = bookings.filter(booking => booking.status === status);
          }
        }
        // If user is customer, they can only see their own bookings
        else {
          bookings = await DatabaseService.getBookingsByUser(session.user.id);
        }
    }
    
    // Get all barbers to map phone numbers
    const allBarbers = await DatabaseService.getBarbers();
    const barberMap = new Map(allBarbers.map(b => [b.id, b]));

    // Format bookings for the admin panel
    const formattedBookings = bookings.map(booking => {
      const barber = barberMap.get(booking.barberId || '');
      return {
        id: booking.id,
        service_name: booking.service,
        barber_name: booking.barberName,
        barber_phone: barber?.phone, // Add barber phone
        booking_date: booking.date,
        booking_time: booking.time,
        customer_name: booking.customerName,
        customer_phone: booking.customerPhone,
        customer_email: booking.customerEmail,
        status: booking.status,
        created_at: booking.createdAt?.toISOString(),
        notes: booking.notes,
      };
    });

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento delle prenotazioni' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {  try {    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Devi essere loggato per effettuare una prenotazione' },
        { status: 401 }
      );
    }

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
        { status: 429 }
      );
    }    const requestData = await request.json();
    console.log('📥 Booking API received data:', JSON.stringify(requestData, null, 2));
    
    // Fetch services data if we have service IDs
    let servicesData: any[] = [];
    let totalPrice = 0;
    let totalDuration = 30;
    
    if (requestData.serviceIds && Array.isArray(requestData.serviceIds)) {
      // Fetch service details from database
      const allServices = await DatabaseService.getAllServices();
      servicesData = allServices.filter(service => 
        requestData.serviceIds.includes(service.id)
      );
      
      if (servicesData.length === 0) {
        return NextResponse.json(
          { error: 'Servizi non trovati' },
          { status: 400 }
        );
      }
      
      totalPrice = servicesData.reduce((sum, service) => sum + parseFloat(service.price), 0);
      totalDuration = servicesData.reduce((sum, service) => sum + service.duration, 0);
    }    // Get barber name
    const barber = await DatabaseService.getBarberById(requestData.barberId);
    const barberName = barber ? barber.name : 'Barbiere';
    
    // Convert old format to new format if needed
    const bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: requestData.userId || null, // null for guest bookings
      customerName: requestData.customerInfo?.name || requestData.customerName,
      customerEmail: requestData.customerInfo?.email || requestData.customerEmail,
      customerPhone: requestData.customerInfo?.phone || requestData.customerPhone,
      barberId: requestData.barberId,
      barberName: requestData.barberName || barberName,
      service: servicesData.length > 0 
        ? servicesData.map(s => s.name).join(', ')
        : requestData.service || 'Servizio Generico',
      price: requestData.totalPrice || requestData.price || totalPrice || 25,
      date: requestData.date,
      time: requestData.time || requestData.timeSlot, // Handle both 'time' and 'timeSlot'
      duration: requestData.totalDuration || requestData.duration || totalDuration,
      status: 'confirmed',      notes: requestData.customerInfo?.notes || requestData.notes || '',
    };
      // Verifica se chi sta prenotando è un barbiere
    const isBarber = session.user.role === 'barber' || session.user.role === 'admin';
    
    // Validazione completa
    const validationErrors = validateBookingData(bookingData, isBarber);
      if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Validazione data (non nel passato)
    const bookingDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
    const now = new Date();
    if (bookingDateTime <= now) {
      return NextResponse.json(
        { error: 'Non puoi prenotare nel passato' },
        { status: 400 }
      );
    }

    // Validazione giorno (non domenica)
    if (bookingDateTime.getDay() === 0) {
      return NextResponse.json(
        { error: 'Siamo chiusi la domenica' },
        { status: 400 }
      );
    }    // Verifica se lo slot è ancora disponibile
    const existingBookings = await DatabaseService.getBookingsByDate(bookingData.date);
    const barberBookings = existingBookings.filter(booking => booking.barberId === String(bookingData.barberId));    
    const conflictingBooking = barberBookings.find(
      booking => booking.time === bookingData.time && booking.status !== 'cancelled'
    );

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Questo slot non è più disponibile' },
        { status: 409 }
      );
    }    // Verifica che l'utente non abbia già una prenotazione nello stesso giorno
    // ECCEZIONE: I barbieri possono fare prenotazioni per clienti diversi lo stesso giorno
    if (session.user.role !== 'barber' && session.user.role !== 'admin') {
      const userBookingsToday = await DatabaseService.getBookingsByUser(session.user.id);
      const userBookingsOnDate = userBookingsToday.filter(
        booking => booking.date === bookingData.date && 
                  booking.status !== 'cancelled'
      );

      if (userBookingsOnDate.length > 0) {
        return NextResponse.json(
          { error: 'Hai già una prenotazione per questo giorno' },
          { status: 409 }
        );
      }
    }// Crea la prenotazione usando il servizio PostgreSQL
    // Per i barbieri: modifica la logica dell'associazione userId
    let finalBookingData;
    if (session.user.role === 'barber' || session.user.role === 'admin') {
      // I barbieri fanno prenotazioni per i clienti, non per se stessi
      finalBookingData = {
        ...bookingData,
        userId: null // Non associare al barbiere, ma al cliente (se esiste)
      };
    } else {
      // Cliente normale: associa la prenotazione al suo account
      finalBookingData = {
        ...bookingData,
        userId: session.user.id
      };
    }
    const newBooking = await DatabaseService.createBooking(finalBookingData);// Invia email di conferma al cliente (async, non blocca la risposta)
    EmailService.sendBookingConfirmation({
      customerName: newBooking.customerName,
      customerEmail: newBooking.customerEmail,
      customerPhone: newBooking.customerPhone,
      barberName: newBooking.barberName,
      service: newBooking.service,
      date: newBooking.date,
      time: newBooking.time,
      price: parseFloat(newBooking.price),
      bookingId: newBooking.id,
    }).catch(error => console.error('Email sending failed:', error));

    // Invia notifica all'admin (async)
    EmailService.sendAdminNotification({
      customerName: newBooking.customerName,
      customerEmail: newBooking.customerEmail,
      customerPhone: newBooking.customerPhone,
      barberName: newBooking.barberName,
      service: newBooking.service,
      date: newBooking.date,
      time: newBooking.time,
      price: parseFloat(newBooking.price),
      bookingId: newBooking.id,
    }).catch(error => console.error('Admin notification failed:', error));

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { bookingId, ...updates } = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'ID prenotazione mancante' },
        { status: 400 }
      );
    }

    const updatedBooking = await DatabaseService.updateBooking(bookingId, updates);
    
    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Prenotazione non trovata' },
        { status: 404 }
      );
    }    // Se la prenotazione viene cancellata, invia email
    if (updates.status === 'cancelled') {
      EmailService.sendBookingCancellation({
        customerName: updatedBooking.customerName,
        customerEmail: updatedBooking.customerEmail,
        customerPhone: updatedBooking.customerPhone,
        barberName: updatedBooking.barberName,
        service: updatedBooking.service,
        date: updatedBooking.date,
        time: updatedBooking.time,
        price: parseFloat(updatedBooking.price),
        bookingId: updatedBooking.id,
      }).catch(error => console.error('Cancellation email failed:', error));
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della prenotazione' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Devi essere loggato per modificare le prenotazioni' },
        { status: 401 }
      );
    }

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
        { status: 429 }
      );
    }

    const requestData = await request.json();
    
    // Validate required fields
    if (!requestData.id) {
      return NextResponse.json(
        { error: 'ID prenotazione è obbligatorio' },
        { status: 400 }
      );
    }

    if (!requestData.status) {
      return NextResponse.json(
        { error: 'Status è obbligatorio' },
        { status: 400 }
      );
    }

    // Validate status value
    if (!['confirmed', 'cancelled', 'pending'].includes(requestData.status)) {
      return NextResponse.json(
        { error: 'Status non valido. Deve essere: confirmed, cancelled, o pending' },
        { status: 400 }
      );
    }

    // Check authorization: barbiere can only modify their own bookings
    if (session.user.role === 'barber') {
      // Get the booking to check if it belongs to this barber
      const allBookings = await DatabaseService.getAllBookings();
      const booking = allBookings.find(b => b.id === requestData.id);
      
      if (!booking) {
        return NextResponse.json(
          { error: 'Prenotazione non trovata' },
          { status: 404 }
        );
      }

      // Get barber info
      const allBarbers = await DatabaseService.getBarbers();
      const currentBarber = allBarbers.find(b => b.email === session.user.email);
        if (!currentBarber || booking.barberId !== currentBarber.id) {
        return NextResponse.json(
          { error: 'Non hai i permessi per modificare questa prenotazione' },
          { status: 403 }
        );
      }
    }

    // Update booking status
    const updatedBooking = await DatabaseService.updateBookingStatus(requestData.id, requestData.status);
    
    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Prenotazione non trovata o aggiornamento fallito' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Status prenotazione aggiornato con successo',
      bookingId: requestData.id,
      newStatus: requestData.status,
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Devi essere loggato per eliminare le prenotazioni' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const bookingId = url.searchParams.get('id');
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'ID prenotazione mancante' },
        { status: 400 }
      );
    }

    // Check authorization: barbiere can only delete their own bookings
    if (session.user.role === 'barber') {
      // Get the booking to check if it belongs to this barber
      const allBookings = await DatabaseService.getAllBookings();
      const booking = allBookings.find(b => b.id === bookingId);
      
      if (!booking) {
        return NextResponse.json(
          { error: 'Prenotazione non trovata' },
          { status: 404 }
        );
      }

      // Get barber info
      const allBarbers = await DatabaseService.getBarbers();
      const currentBarber = allBarbers.find(b => b.email === session.user.email);
      
      if (!currentBarber || booking.barberId !== currentBarber.id) {
        return NextResponse.json(
          { error: 'Non hai i permessi per eliminare questa prenotazione' },
          { status: 403 }
        );
      }
    }

    const success = await DatabaseService.deleteBooking(bookingId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Prenotazione non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della prenotazione' },
      { status: 500 }
    );
  }
}

// Helper functions
function getBarberName(barberId: string | number): string {
  const barbers: { [key: string]: string } = {
    'fabio': 'Fabio',
    'michele': 'Michele',
    '1': 'Fabio',    // Support numeric IDs
    '2': 'Michele',
  };
  return barbers[String(barberId)] || 'Barbiere';
}

function calculatePrice(services: any): number {
  if (!services) return 25; // Default price
  if (Array.isArray(services)) {
    return services.reduce((total: number, service: any) => total + (service.price || 25), 0);
  }
  return services.price || 25;
}

function validateBookingData(data: any, isBarber: boolean = false): string[] {
  const errors: string[] = [];

  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.push('Nome cliente deve essere di almeno 2 caratteri');
  }

  // Per i barbieri, email e telefono sono opzionali
  if (!isBarber) {
    if (!data.customerEmail) {
      errors.push('Email cliente è obbligatoria');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.customerEmail)) {
        errors.push('Formato email non valido');
      }
    }

    if (!data.customerPhone) {
      errors.push('Telefono cliente è obbligatorio');
    }
  } else {
    // Per i barbieri, valida email solo se fornita
    if (data.customerEmail && data.customerEmail.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.customerEmail)) {
        errors.push('Formato email non valido');
      }
    }
    // Telefono opzionale per barbieri - nessuna validazione se vuoto
  }

  if (!data.barberId) {
    errors.push('Barbiere è obbligatorio');
  }

  if (!data.service) {
    errors.push('Servizio è obbligatorio');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Prezzo deve essere maggiore di 0');
  }

  if (!data.date) {
    errors.push('Data è obbligatoria');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push('Formato data non valido (YYYY-MM-DD)');
    }
  }

  if (!data.time) {
    errors.push('Orario è obbligatorio');
  } else {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(data.time)) {
      errors.push('Formato orario non valido (HH:MM)');
    }
  }

  return errors;
}
