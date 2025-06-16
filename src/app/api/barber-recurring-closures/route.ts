import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { db } from '@/lib/database-postgres';
import { eq } from 'drizzle-orm';
import { barberRecurringClosures } from '@/lib/schema';

// GET - Ottiene le chiusure ricorrenti per un barbiere
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const barberEmail = searchParams.get('barberEmail');

    // Se non è specificato un barbiere, usa quello della sessione
    const targetBarber = barberEmail || session.user.email;

    // Solo admin possono vedere le chiusure di altri barbieri
    const isAdmin = session.user.role === 'admin';
    if (!isAdmin && targetBarber !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cerca le chiusure ricorrenti per il barbiere
    const result = await db.select()
      .from(barberRecurringClosures)
      .where(eq(barberRecurringClosures.barberEmail, targetBarber))
      .limit(1);

    if (result.length === 0) {
      // Se non esistono chiusure ricorrenti, ritorna array vuoto
      return NextResponse.json({ closedDays: [] });
    }

    const closures = result[0];
    const closedDays = JSON.parse(closures.closedDays);

    console.log('✅ Loaded recurring closures for barber:', targetBarber, closedDays);
    return NextResponse.json({ closedDays });

  } catch (error) {
    console.error('Error fetching barber recurring closures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Salva le chiusure ricorrenti per un barbiere
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { closedDays, barberEmail } = await request.json();

    // Se non è specificato un barbiere, usa quello della sessione
    const targetBarber = barberEmail || session.user.email;

    // Solo admin possono modificare le chiusure di altri barbieri
    const isAdmin = session.user.role === 'admin';
    if (!isAdmin && targetBarber !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validazione dei dati
    if (!Array.isArray(closedDays)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Validazione dei giorni (0-6)
    if (closedDays.some((day: any) => typeof day !== 'number' || day < 0 || day > 6)) {
      return NextResponse.json({ error: 'Invalid day numbers' }, { status: 400 });
    }

    // Controlla se esiste già un record per questo barbiere
    const existing = await db.select()
      .from(barberRecurringClosures)
      .where(eq(barberRecurringClosures.barberEmail, targetBarber))
      .limit(1);

    const closedDaysJson = JSON.stringify(closedDays);

    if (existing.length > 0) {
      // Aggiorna il record esistente
      await db.update(barberRecurringClosures)
        .set({
          closedDays: closedDaysJson,
          updatedAt: new Date(),
        })
        .where(eq(barberRecurringClosures.barberEmail, targetBarber));

      console.log('✅ Updated recurring closures for barber:', targetBarber, closedDays);
    } else {
      // Crea un nuovo record
      await db.insert(barberRecurringClosures)
        .values({
          barberEmail: targetBarber,
          closedDays: closedDaysJson,
          createdBy: session.user.email,
        });

      console.log('✅ Created recurring closures for barber:', targetBarber, closedDays);
    }

    return NextResponse.json({ 
      success: true, 
      closedDays,
      barberEmail: targetBarber
    });

  } catch (error) {
    console.error('Error saving barber recurring closures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
