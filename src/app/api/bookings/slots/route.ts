import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

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

    // Generate all possible time slots for the day
    const allTimeSlots = generateAllTimeSlots(date);
    
    // Get available slots from database
    const availableSlotTimes = await DatabaseService.getAvailableSlots(barberId, date);
    
    // Create TimeSlot objects with availability status
    const timeSlots: TimeSlot[] = allTimeSlots.map(time => ({
      time,
      available: availableSlotTimes.includes(time)
    }));
    
    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}

function generateAllTimeSlots(dateString: string): string[] {
  const slots: string[] = [];
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  
  // Sunday closed
  if (dayOfWeek === 0) {
    return slots;
  }

  // Morning slots: 9:00-12:30 (including 12:30)
  for (let hour = 9; hour <= 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Stop at 12:30 for the last morning slot
      if (hour === 12 && minute > 30) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  // Afternoon slots: 15:00-17:30 (including 17:30)
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
