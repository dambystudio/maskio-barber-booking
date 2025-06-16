import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test solo variabili d'ambiente
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
    
    return NextResponse.json({
      environment: {
        adminEmails: adminEmails,
        barberEmails: barberEmails,
        adminEmailsRaw: process.env.ADMIN_EMAILS,
        barberEmailsRaw: process.env.BARBER_EMAILS,
        hasAdminEmails: !!process.env.ADMIN_EMAILS,
        hasBarberEmails: !!process.env.BARBER_EMAILS,
        nodeEnv: process.env.NODE_ENV
      },
      davideCheck: {
        isInAdminEmails: adminEmails.includes('davide431@outlook.it'),
        isInBarberEmails: barberEmails.includes('davide431@outlook.it')
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Errore del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}
