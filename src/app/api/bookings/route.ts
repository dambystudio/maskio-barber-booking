import { NextRequest, NextResponse } from 'next/server';
import { Booking } from '../../../types/booking';
import { readBookings, writeBookings } from '../../../lib/storage';

// Verifica se c'è conflitto di orario
function hasTimeConflict(existingBookings: Booking[], newBooking: Omit<Booking, 'id'>): boolean {
  return existingBookings.some(booking => {
    if (booking.barberId !== newBooking.barberId || booking.date !== newBooking.date) {
      return false;
    }    const existingStart = timeToMinutes(booking.time);
    const existingEnd = existingStart + (booking.totalDuration || booking.duration);
    const newStart = timeToMinutes(newBooking.time);
    const newEnd = newStart + (newBooking.totalDuration || newBooking.duration);

    // C'è conflitto se gli orari si sovrappongono
    return (newStart < existingEnd && newEnd > existingStart);
  });
}

// Converte l'orario in minuti per facilitare i calcoli
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// GET - Ottieni tutte le prenotazioni
export async function GET() {
  try {
    const bookings = await readBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Errore nel leggere le prenotazioni:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// POST - Crea una nuova prenotazione
export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    
    // Validazione dei dati
    if (!bookingData.barberId || !bookingData.date || !bookingData.time || 
        !bookingData.customerInfo?.name || !bookingData.customerInfo?.email || 
        !bookingData.customerInfo?.phone || !bookingData.services?.length) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.customerInfo.email)) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
    }    // Validazione data e ora (non nel passato)
    const now = new Date();
    const bookingDateTime = new Date(`${bookingData.date}T${bookingData.time}:00`);
    
    if (bookingDateTime <= now) {
      return NextResponse.json({ error: 'Non puoi prenotare nel passato o nell\'orario corrente' }, { status: 400 });
    }    // Validazione giorno (non domenica)
    if (bookingDateTime.getDay() === 0) {
      return NextResponse.json({ error: 'Siamo chiusi la domenica' }, { status: 400 });
    }

    const existingBookings = await readBookings();
    
    // Verifica conflitti di orario
    if (hasTimeConflict(existingBookings, bookingData)) {
      return NextResponse.json({ error: 'Orario non disponibile' }, { status: 409 });
    }    // Crea la nuova prenotazione
    const newBooking: Booking = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...bookingData,
      duration: bookingData.totalDuration, // per compatibilità
      createdAt: new Date().toISOString()
    };

    // Aggiungi la prenotazione
    existingBookings.push(newBooking);
    await writeBookings(existingBookings);

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Errore nel creare la prenotazione:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
