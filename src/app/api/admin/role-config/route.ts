import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';

// API per gestire le email autorizzate per i ruoli
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Solo admin possono vedere le configurazioni dei ruoli
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso negato. Solo admin possono visualizzare le configurazioni.' },
        { status: 403 }
      );
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];

    return NextResponse.json({
      adminEmails,
      barberEmails,
      environment: process.env.NODE_ENV,
      warning: 'Per modificare questi ruoli, aggiorna le variabili d\'ambiente ADMIN_EMAILS e BARBER_EMAILS'
    });

  } catch (error) {
    console.error('Error fetching role configuration:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Endpoint informativo per sviluppatori
export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Per modificare i ruoli autorizzati, aggiorna le variabili d\'ambiente:',
    instructions: {
      development: 'Modifica il file .env.local',
      production: 'Configura le variabili d\'ambiente su Vercel',
      format: {
        ADMIN_EMAILS: 'email1@domain.com,email2@domain.com',
        BARBER_EMAILS: 'barber1@domain.com,barber2@domain.com'
      }
    },
    currentConfig: {
      admins: process.env.ADMIN_EMAILS?.split(',').length || 0,
      barbers: process.env.BARBER_EMAILS?.split(',').length || 0
    }
  });
}
