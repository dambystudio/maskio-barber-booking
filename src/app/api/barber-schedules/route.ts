import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// POST - Crea/Aggiorna schedule per apertura eccezionale
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barberEmail, date, dayOff, allDay } = await request.json();

    if (!barberEmail || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get barber ID from email
    const barbers = await sql`
      SELECT id FROM barbers WHERE email = ${barberEmail}
    `;

    if (barbers.length === 0) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    const barberId = barbers[0].id;

    // Generate full day slots based on day of week
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    
    let availableSlots: string[] = [];
    
    if (!dayOff && allDay) {
      // Generate slots based on day
      if (dayOfWeek === 1) { // Monday - Michele afternoon only
        if (barberEmail === 'michelebiancofiore0230@gmail.com') {
          availableSlots = ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
        } else {
          // Fabio closed on Monday
          availableSlots = [];
        }
      } else if (dayOfWeek === 6) { // Saturday
        availableSlots = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
          '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
        ];
      } else { // Tuesday-Friday
        availableSlots = [
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
          '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
        ];
      }
    }

    // Check if schedule already exists
    const existingSchedule = await sql`
      SELECT * FROM barber_schedules
      WHERE barber_id = ${barberId} AND date = ${date}
    `;

    if (existingSchedule.length > 0) {
      // Update existing schedule
      await sql`
        UPDATE barber_schedules
        SET day_off = ${dayOff},
            available_slots = ${JSON.stringify(availableSlots)},
            updated_at = NOW()
        WHERE barber_id = ${barberId} AND date = ${date}
      `;

      console.log('✅ Schedule updated:', { barberId, date, dayOff, slotsCount: availableSlots.length });
    } else {
      // Create new schedule
      await sql`
        INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
        VALUES (${barberId}, ${date}, ${JSON.stringify(availableSlots)}, '[]', ${dayOff})
      `;

      console.log('✅ Schedule created:', { barberId, date, dayOff, slotsCount: availableSlots.length });
    }

    return NextResponse.json({ 
      success: true,
      barberId,
      date,
      dayOff,
      availableSlots
    });

  } catch (error) {
    console.error('Error managing barber schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Rimuove apertura eccezionale (riporta a day_off=true)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barberEmail, date } = await request.json();

    if (!barberEmail || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get barber ID from email
    const barbers = await sql`
      SELECT id FROM barbers WHERE email = ${barberEmail}
    `;

    if (barbers.length === 0) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    const barberId = barbers[0].id;

    // Set schedule back to day_off=true (closed)
    await sql`
      UPDATE barber_schedules
      SET day_off = true,
          available_slots = '[]',
          updated_at = NOW()
      WHERE barber_id = ${barberId} AND date = ${date}
    `;

    console.log('✅ Exceptional opening removed:', { barberId, date });

    return NextResponse.json({ 
      success: true,
      barberId,
      date
    });

  } catch (error) {
    console.error('Error removing exceptional opening:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
