import { NextRequest, NextResponse } from 'next/server';
import { Booking } from '../../../../types/booking';
import { readBookings } from '../../../../lib/storage';

// Genera gli slot temporali disponibili
function generateTimeSlots(date: Date): string[] {
  const slots: string[] = [];
  const dayOfWeek = date.getDay();
  
  // Domenica chiuso
  if (dayOfWeek === 0) {
    return slots;
  }
  
  // Slot mattina: 9:00-12:30 (incluso 12:30)
  for (let hour = 9; hour <= 12; hour++) {
    const maxMinute = hour === 12 ? 30 : 60; // Solo fino a 12:30
    for (let minute = 0; minute < maxMinute; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  // Slot pomeriggio: 15:00-17:30 (incluso 17:30)
  for (let hour = 15; hour <= 17; hour++) {
    const maxMinute = hour === 17 ? 30 : 60; // Solo fino a 17:30
    for (let minute = 0; minute < maxMinute; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
}

// Verifica se uno slot temporale è disponibile
function isTimeSlotAvailable(existingBookings: Booking[], date: string, time: string, barberId: string): boolean {
  const existingBooking = existingBookings.find(booking => 
    booking.barberId === barberId && 
    booking.date === date && 
    isTimeConflict(booking.time, booking.totalDuration || booking.duration, time)
  );
  
  return !existingBooking;
}

// Verifica se c'è un conflitto di orario
function isTimeConflict(bookedTime: string, bookedDuration: number, requestedTime: string): boolean {
  const bookedStart = timeToMinutes(bookedTime);
  const bookedEnd = bookedStart + bookedDuration;
  const requestedStart = timeToMinutes(requestedTime);
  const requestedEnd = requestedStart + 30; // Slot da 30 minuti
  
  // C'è conflitto se gli orari si sovrappongono
  return (requestedStart < bookedEnd && requestedEnd > bookedStart);
}

// Converte l'orario in minuti per facilitare i calcoli
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// GET - Ottieni slot disponibili per una data e barbiere specifici
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');

    if (!date || !barberId) {
      return NextResponse.json({ error: 'Date e barberId sono richiesti' }, { status: 400 });
    }

    const selectedDate = new Date(date);
    const allSlots = generateTimeSlots(selectedDate);
    const existingBookings = await readBookings();

    const availableSlots = allSlots.map(time => ({
      time,
      available: isTimeSlotAvailable(existingBookings, date, time, barberId)
    }));

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error('Errore nel generare gli slot:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
