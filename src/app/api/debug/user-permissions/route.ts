import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione
    const session = await auth();
    
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

    return NextResponse.json({
      authenticated: true,
      user: {
        email: userEmail,
        name: session.user.name,
        id: session.user.id
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
        barberEmailsRaw: process.env.BARBER_EMAILS
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
            length: { stored: email.length, user: userEmail.length }
          }))
        }
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Errore del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}
