import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email richiesta',
        success: false 
      });
    }

    // Controlla le variabili d'ambiente
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
    
    const isAdmin = adminEmails.includes(email);
    const isBarber = barberEmails.includes(email);

    return NextResponse.json({
      success: true,
      email,
      permissions: {
        isAdmin,
        isBarber,
        hasManagementAccess: isAdmin || isBarber
      },
      environment: {
        hasAdminEmails: !!process.env.ADMIN_EMAILS,
        hasBarberEmails: !!process.env.BARBER_EMAILS,
        adminEmailsCount: adminEmails.length,
        barberEmailsCount: barberEmails.length
      },
      debug: {
        adminEmailsArray: adminEmails,
        barberEmailsArray: barberEmails,
        emailComparison: adminEmails.map(adminEmail => ({
          stored: adminEmail,
          user: email,
          match: adminEmail === email
        }))
      }
    });

  } catch (error) {
    console.error('Check permissions error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Errore del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}
