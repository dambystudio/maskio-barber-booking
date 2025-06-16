import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { users, bookings, accounts, sessions, verificationTokens, closureSettings } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Solo admin possono pulire il database
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso negato. Solo admin possono pulire il database.' },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    if (!action || !['users', 'bookings', 'all'].includes(action)) {
      return NextResponse.json(
        { error: 'Azione non valida. Usare: users, bookings, o all' },
        { status: 400 }
      );
    }

    const results: any = {};

    if (action === 'users' || action === 'all') {
      // Cancella in ordine per rispettare le foreign key
      const sessionsDeleted = await db.delete(sessions);
      results.sessionsDeleted = sessionsDeleted.rowCount || 0;
      
      const accountsDeleted = await db.delete(accounts);
      results.accountsDeleted = accountsDeleted.rowCount || 0;
      
      const tokensDeleted = await db.delete(verificationTokens);
      results.tokensDeleted = tokensDeleted.rowCount || 0;
      
      const usersDeleted = await db.delete(users);
      results.usersDeleted = usersDeleted.rowCount || 0;
    }

    if (action === 'bookings' || action === 'all') {
      const bookingsDeleted = await db.delete(bookings);
      results.bookingsDeleted = bookingsDeleted.rowCount || 0;
    }

    if (action === 'all') {
      // Reset closure settings to default
      await db.delete(closureSettings);
      
      // Ricrea le impostazioni di default
      await db.insert(closureSettings).values({
        id: 'shop_closures',
        closedDays: '[0]', // Solo domenica
        closedDates: '[]',
        updatedAt: new Date(),
        updatedBy: null
      });
      
      results.closureSettingsReset = true;
    }

    return NextResponse.json({
      success: true,
      action,
      results,
      message: `Database cleanup completato: ${action}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error cleaning database:', error);
    return NextResponse.json(
      { error: 'Errore interno del server durante la pulizia' },
      { status: 500 }
    );
  }
}
