import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '../../../../lib/database-postgres';
import { users } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 🔐 SECURITY FIX: accessibile solo agli admin
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso negato. Solo gli admin possono accedere a questa route.' },
        { status: 403 }
      );
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(e => e.trim()) || [];

    const userEmail = session.user.email;
    const isAdmin = adminEmails.includes(userEmail);
    const isBarber = barberEmails.includes(userEmail);

    let dbUser = null;
    try {
      const dbUsers = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      }).from(users).where(eq(users.email, userEmail)).limit(1);
      dbUser = dbUsers[0] || null;
    } catch (dbError) {
      console.error('Errore database:', dbError);
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: userEmail,
        name: session.user.name,
        id: session.user.id,
        dbExists: !!dbUser,
        dbId: dbUser?.id,
        dbRole: dbUser?.role,
        // ⚠️ Telefono e dati personali rimossi dalla risposta debug
      },
      permissions: {
        isAdmin,
        isBarber,
        hasSpecialPermissions: isAdmin || isBarber
      },
      environment: {
        // ⚠️ Email complete e valori raw rimossi per sicurezza
        adminEmailsCount: adminEmails.length,
        barberEmailsCount: barberEmails.length,
        hasAdminEmails: !!process.env.ADMIN_EMAILS,
        hasBarberEmails: !!process.env.BARBER_EMAILS
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Errore del server',
    }, { status: 500 });
  }
}
