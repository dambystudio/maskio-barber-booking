import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database-postgres';

export async function GET() {
  try {
    // 🔐 SECURITY FIX: accessibile solo agli admin
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso negato. Solo gli admin possono accedere a questa route.' },
        { status: 403 }
      );
    }

    // Mantiene la funzionalità di debug degli schedule solo per gli admin
    const barbers = ['fabio', 'michele'];
    const date = new Date().toISOString().split('T')[0]; // oggi invece di data hardcoded

    const result = [];

    for (const barberId of barbers) {
      const schedule = await DatabaseService.getBarberSchedule(barberId, date);

      let availableSlots: string[] = [];
      let unavailableSlots: string[] = [];

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
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking schedules:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
