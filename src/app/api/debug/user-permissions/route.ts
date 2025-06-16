import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '../../../../lib/database-postgres';
import { users } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione dal request
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Non autenticato',
        authenticated: false 
      });
    }

    // Controlla le variabili d'ambiente
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
    
    const userEmail = session.user.email;
    const isAdmin = adminEmails.includes(userEmail);
    const isBarber = barberEmails.includes(userEmail);

    // Cerca l'utente nel database per info aggiuntive
    let dbUser = null;
    try {
      const dbUsers = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
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
        dbPhone: dbUser?.phone
      },
      permissions: {
        isAdmin,
        isBarber,
        hasSpecialPermissions: isAdmin || isBarber
      },
      environment: {
        adminEmails: adminEmails,
        barberEmails: barberEmails,
        adminEmailsRaw: process.env.ADMIN_EMAILS,
        barberEmailsRaw: process.env.BARBER_EMAILS,
        hasAdminEmails: !!process.env.ADMIN_EMAILS,
        hasBarberEmails: !!process.env.BARBER_EMAILS
      },
      debug: {
        emailMatch: {
          userEmail,
          exactMatch: adminEmails.includes(userEmail),
          adminEmailsArray: adminEmails,
          comparison: adminEmails.map(email => ({
            stored: email,
            user: userEmail,
            match: email === userEmail,
            length: { stored: email.length, user: userEmail.length },
            trimmed: email.trim() === userEmail.trim()
          }))
        }
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Errore del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
