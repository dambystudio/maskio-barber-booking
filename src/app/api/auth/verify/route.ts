import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { VerificationService } from '@/lib/verification';

// Send verification code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { type, email, phone } = await request.json();

    if (type === 'email' && email) {
      const success = await VerificationService.sendEmailVerification(
        session.user.id,
        email
      );
      
      if (success) {
        return NextResponse.json({
          message: 'Codice di verifica inviato via email',
          success: true
        });
      } else {
        return NextResponse.json(
          { error: 'Errore nell\'invio dell\'email' },
          { status: 500 }
        );
      }
    }

    if (type === 'phone' && phone) {
      const success = await VerificationService.sendSMSVerification(
        session.user.id,
        phone
      );
      
      if (success) {
        return NextResponse.json({
          message: 'Codice di verifica inviato via SMS',
          success: true
        });
      } else {
        return NextResponse.json(
          { error: 'Errore nell\'invio dell\'SMS' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Tipo di verifica non valido' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Verification send error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Verify code
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { type, code } = await request.json();

    let success = false;

    if (type === 'email') {
      success = await VerificationService.verifyEmailCode(
        session.user.id,
        code
      );
    } else if (type === 'phone') {
      success = await VerificationService.verifyPhoneCode(
        session.user.id,
        code
      );
    }

    if (success) {
      return NextResponse.json({
        message: 'Verifica completata con successo',
        verified: true
      });
    } else {
      return NextResponse.json(
        { error: 'Codice non valido o scaduto' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Verification verify error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
