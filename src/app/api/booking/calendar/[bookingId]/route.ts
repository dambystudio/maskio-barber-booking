import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database-postgres';
import { bookings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { generateICSFile } from '@/lib/calendar-utils';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params;

    if (!bookingId) {
      return new NextResponse('ID prenotazione mancante', { status: 400 });
    }

    // Recupera i dati della prenotazione dal database
    const booking = await db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        service: bookings.service,
        barberName: bookings.barberName,
        date: bookings.date,
        time: bookings.time,
        notes: bookings.notes,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (booking.length === 0) {
      return new NextResponse('Prenotazione non trovata', { status: 404 });
    }

    const bookingData = booking[0];

    // Genera il file .ics
    const icsContent = generateICSFile({
      id: bookingData.id,
      customerName: bookingData.customerName,
      service: bookingData.service,
      barber: bookingData.barberName,
      date: bookingData.date,
      time: bookingData.time,
      notes: bookingData.notes || undefined,
    });

    // Genera nome file
    const fileName = `prenotazione-maskio-${bookingData.date}-${bookingData.time.replace(':', '')}.ics`;

    // Restituisci il file .ics
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('❌ Error generating calendar file:', error);
    return new NextResponse('Errore nella generazione del file calendario', { 
      status: 500 
    });
  }
}
