import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-postgres';

export async function GET() {
  try {
    // Check schedules for both barbers
    const barbers = ['fabio', 'michele'];
    const date = '2025-05-28';
    
    const result = [];
    
    for (const barberId of barbers) {
      const schedule = await DatabaseService.getBarberSchedule(barberId, date);
      
      let availableSlots = [];
      let unavailableSlots = [];
      
      if (schedule) {
        availableSlots = schedule.availableSlots ? JSON.parse(schedule.availableSlots) : [];
        unavailableSlots = schedule.unavailableSlots ? JSON.parse(schedule.unavailableSlots) : [];
      }
      
      result.push({
        barberId,
        date,
        dayOff: schedule?.dayOff || false,
        availableSlots,
        unavailableSlots,
        hasLunchInAvailable: availableSlots.includes('12:00') || availableSlots.includes('12:30'),
        hasLunchInUnavailable: unavailableSlots.includes('12:00') || unavailableSlots.includes('12:30'),
        lunchSlots: {
          '12:00': {
            inAvailable: availableSlots.includes('12:00'),
            inUnavailable: unavailableSlots.includes('12:00')
          },
          '12:30': {
            inAvailable: availableSlots.includes('12:30'),
            inUnavailable: unavailableSlots.includes('12:30')
          }
        }
      });
    }
    
    return NextResponse.json(result);  } catch (error) {
    console.error('Error checking schedules:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}
