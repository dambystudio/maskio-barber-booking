import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database-postgres';
import { eq } from 'drizzle-orm';
import { barberRecurringClosures, barbers } from '@/lib/schema';

// GET - Ottiene le chiusure ricorrenti per un barbiere (endpoint pubblico)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');

    if (!barberId) {
      return NextResponse.json({ error: 'barberId parameter is required' }, { status: 400 });
    }

    // Prima ottieni l'email del barbiere dal suo ID
    const barberData = await db.select()
      .from(barbers)
      .where(eq(barbers.id, barberId))
      .limit(1);

    if (barberData.length === 0) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }    const barberEmail = barberData[0].email;

    if (!barberEmail) {
      return NextResponse.json({ error: 'Barber email not found' }, { status: 404 });
    }

    // Cerca le chiusure ricorrenti per il barbiere
    const result = await db.select()
      .from(barberRecurringClosures)
      .where(eq(barberRecurringClosures.barberEmail, barberEmail))
      .limit(1);

    if (result.length === 0) {
      // Se non esistono chiusure ricorrenti, ritorna array vuoto
      return NextResponse.json({ closedDays: [] });
    }

    const closures = result[0];
    const closedDays = JSON.parse(closures.closedDays);

    console.log('✅ Loaded recurring closures for barber:', barberId, closedDays);
    return NextResponse.json({ closedDays });

  } catch (error) {
    console.error('Error fetching barber recurring closures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
