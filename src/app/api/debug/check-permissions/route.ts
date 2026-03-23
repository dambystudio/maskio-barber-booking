import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 🔐 SECURITY FIX: accessibile solo ad admin e barbieri (usato dal frontend per check permessi)
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || (session.user.role !== 'admin' && session.user.role !== 'barber')) {
      return NextResponse.json(
        { error: 'Accesso negato. Riservato allo staff.' },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        error: 'Email richiesta',
        success: false
      });
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(e => e.trim()) || [];

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
        // ⚠️ Array completi delle email rimossi per sicurezza
      }
    });

  } catch (error) {
    console.error('Check permissions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore del server'
    }, { status: 500 });
  }
}
