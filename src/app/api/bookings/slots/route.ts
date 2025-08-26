import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { isDateClosed, getClosureSettings } from '@/lib/closure-utils';
import { isBarberClosed } from '@/lib/barber-closures';

interface TimeSlot {
  time: string;
  available: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    const date = searchParams.get('date');
    
    if (!barberId || !date) {
      return NextResponse.json(
        { error: 'barberId and date are required' },
        { status: 400 }
      );
    }

    // Verifica se la data è chiusa per tutto il negozio
    const dateIsClosed = await isDateClosed(date);
    if (dateIsClosed) {
      console.log(`Date ${date} is closed according to closure settings`);
      return NextResponse.json([]);
    }

    // Get available slots from database (ora include la logica di generazione automatica)
    const availableSlotTimes = await DatabaseService.getAvailableSlots(barberId, date);
    
    // Ottieni l'email del barbiere dal database
    const barberData = await DatabaseService.getBarberById(barberId);
    const barberEmail = barberData?.email;
    
    // Create TimeSlot objects with availability status, considerando le chiusure specifiche del barbiere
    const timeSlots: TimeSlot[] = [];
    
    // Generate all possible time slots for comparison
    const allPossibleSlots = generateAllTimeSlots(date);
    
    for (const time of allPossibleSlots) {
      let available = availableSlotTimes.includes(time);
      
      // Controlla se il barbiere è chiuso per questo orario specifico
      if (available && barberEmail) {
        const barberIsClosed = await isBarberClosed(barberEmail, date, time);
        if (barberIsClosed) {
          available = false;
          console.log(`Barber ${barberEmail} is closed at ${time} on ${date}`);
        }
      }
      
      timeSlots.push({
        time,
        available
      });
    }
    
    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

// Manteniamo questa funzione per generare tutti gli slot possibili per il confronto
function generateAllTimeSlots(dateString: string): string[] {
  const slots: string[] = [];
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  
  // Skip domenica (0) - giorno di chiusura standard
  if (dayOfWeek === 0) {
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

  // Weekdays: Morning slots 9:00-12:30
  for (let hour = 9; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Stop at 12:30 for the last morning slot
      if (hour === 12 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  // Weekdays: Afternoon slots 15:00-17:30
  for (let hour = 15; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Stop at 17:30 for the last afternoon slot
      if (hour === 17 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
}
