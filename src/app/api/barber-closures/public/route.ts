import { NextRequest, NextResponse } from 'next/server';
import { getBarberClosures } from '@/lib/barber-closures';
import { db } from '@/lib/database-postgres';
import { eq } from 'drizzle-orm';
import { barbers } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    const barberEmail = searchParams.get('barberEmail');

    if (!barberId && !barberEmail) {
      return NextResponse.json(
        { error: 'barberId or barberEmail parameter is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching public closures for barber: ${barberId || barberEmail}`);

    // Get barber email - either directly provided or lookup from ID
    let finalBarberEmail = barberEmail;
    
    if (barberId && !barberEmail) {
      // Lookup barber email from ID
      const barberResult = await db.select({ email: barbers.email })
        .from(barbers)
        .where(eq(barbers.id, barberId))
        .limit(1);
        
      if (barberResult.length === 0) {
        return NextResponse.json(
          { error: 'Barber not found' },
          { status: 404 }
        );
      }
      
      finalBarberEmail = barberResult[0].email;
      if (!finalBarberEmail) {
        return NextResponse.json(
          { error: 'Barber email not found' },
          { status: 404 }
        );
      }
    }
    
    if (!finalBarberEmail) {
      return NextResponse.json(
        { error: 'Valid barber email is required' },
        { status: 400 }
      );
    }
    
    const closures = await getBarberClosures(finalBarberEmail);
    
    // Process closures to return only the necessary public information
    const publicClosures = {
      fullDayClosures: [] as string[], // Array of date strings (YYYY-MM-DD)
      morningClosures: [] as string[],
      afternoonClosures: [] as string[]
    };

    closures.forEach(closure => {
      const dateString = closure.closureDate;
      
      switch (closure.closureType) {
        case 'full':
          publicClosures.fullDayClosures.push(dateString);
          break;
        case 'morning':
          publicClosures.morningClosures.push(dateString);
          break;
        case 'afternoon':
          publicClosures.afternoonClosures.push(dateString);
          break;
      }
    });

    console.log(`✅ Returning public closures:`, publicClosures);

    return NextResponse.json(publicClosures);

  } catch (error) {
    console.error('❌ Error fetching public barber closures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barber closures' },
      { status: 500 }
    );
  }
}
