import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { db } from '@/lib/database-postgres';
import { users, bookings, closureSettings } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Solo admin possono vedere lo status del database
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso negato. Solo admin possono visualizzare lo stato del database.' },
        { status: 403 }
      );
    }

    // Conta utenti per ruolo
    const userStats = await db
      .select({
        role: users.role,
        count: sql`count(*)`.as('count')
      })
      .from(users)
      .groupBy(users.role);

    // Conta prenotazioni per stato
    const bookingStats = await db
      .select({
        status: bookings.status,
        count: sql`count(*)`.as('count')
      })
      .from(bookings)
      .groupBy(bookings.status);

    // Ultimi utenti registrati
    const recentUsers = await db
      .select({
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(5);    // Prossime prenotazioni
    const upcomingBookings = await db
      .select({
        customerName: bookings.customerName,
        service: bookings.service,
        barberName: bookings.barberName,
        date: bookings.date,
        time: bookings.time,
        status: bookings.status
      })
      .from(bookings)
      .where(sql`${bookings.date} >= CURRENT_DATE`)
      .orderBy(bookings.date, bookings.time)
      .limit(5);

    // Impostazioni chiusure
    const closures = await db
      .select()
      .from(closureSettings)
      .where(sql`${closureSettings.id} = 'shop_closures'`)
      .limit(1);

    const response = {      users: {
        stats: userStats,
        recent: recentUsers,
        total: userStats.reduce((sum, stat) => sum + parseInt(String(stat.count)), 0)
      },
      bookings: {
        stats: bookingStats,
        upcoming: upcomingBookings,
        total: bookingStats.reduce((sum, stat) => sum + parseInt(String(stat.count)), 0)
      },
      closures: closures.length > 0 ? {
        closedDays: JSON.parse(closures[0].closedDays),
        closedDates: JSON.parse(closures[0].closedDates),
        updatedAt: closures[0].updatedAt
      } : null,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching database status:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
