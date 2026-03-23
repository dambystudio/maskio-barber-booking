import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 🔐 SECURITY FIX: route accessibile solo agli admin
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso negato. Solo gli admin possono accedere a questa route.' },
        { status: 403 }
      );
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];

    return NextResponse.json({
      environment: {
        adminEmailsCount: adminEmails.length,
        barberEmailsCount: barberEmails.length,
        hasAdminEmails: !!process.env.ADMIN_EMAILS,
        hasBarberEmails: !!process.env.BARBER_EMAILS,
        nodeEnv: process.env.NODE_ENV
        // ⚠️ Email e valori raw rimossi per sicurezza — visibili solo nel pannello Vercel
      },
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Errore del server',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}
