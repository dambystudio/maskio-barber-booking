import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { neon } from '@neondatabase/serverless';
import { format } from 'date-fns';

const sql = neon(process.env.DATABASE_URL!);

// GET - Ottiene le aperture eccezionali (schedule con day_off=false in giorni chiusi per chiusura ricorrente)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || format(new Date(), 'yyyy-MM-dd');

    // Get all schedules from date onwards where day_off=false
    const schedules = await sql`
      SELECT bs.date, b.email as barber_email, b.name as barber_name, bs.day_off
      FROM barber_schedules bs
      JOIN barbers b ON bs.barber_id = b.id
      WHERE bs.date >= ${from}
      AND bs.day_off = false
      ORDER BY bs.date
    `;

    // For each schedule, check if it's on a day that would normally be closed (recurring closure)
    const exceptions: any[] = [];
    
    for (const schedule of schedules) {
      const dateObj = new Date(schedule.date + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();
      
      // Check if this barber has a recurring closure for this day of week
      const recurringClosures = await sql`
        SELECT closed_days FROM barber_recurring_closures
        WHERE barber_email = ${schedule.barber_email}
      `;
      
      if (recurringClosures.length > 0) {
        const closedDays = JSON.parse(recurringClosures[0].closed_days);
        if (closedDays.includes(dayOfWeek)) {
          // This is an exceptional opening!
          exceptions.push({
            date: schedule.date,
            barberEmail: schedule.barber_email,
            barberName: schedule.barber_name,
            dayOfWeek,
            normallyClosedDay: true
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      exceptions
    });

  } catch (error) {
    console.error('Error fetching exceptional openings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
