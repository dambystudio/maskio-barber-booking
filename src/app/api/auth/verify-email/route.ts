import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EmailVerificationService } from '@/lib/email-verification';

// Send email verification code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email richiesta' },
        { status: 400 }
      );
    }

    const result = await EmailVerificationService.sendEmailVerification(
      session.user.id,
      email
    );
    
    if (result.success) {
      // In development, return the code for testing
      const response: any = {
        message: 'Codice di verifica inviato via email',
        success: true
      };
      
      if (process.env.NODE_ENV === 'development' && result.code) {
        response.devCode = result.code; // Only for testing
      }
      
      return NextResponse.json(response);
    } else {
      return NextResponse.json(
        { error: 'Errore nell\'invio dell\'email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email verification send error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Verify email code
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Codice richiesto' },
        { status: 400 }
      );
    }

    const success = await EmailVerificationService.verifyEmailCode(
      session.user.id,
      code
    );

    if (success) {
      return NextResponse.json({
        message: 'Email verificata con successo! ✅',
        verified: true
      });
    } else {
      return NextResponse.json(
        { error: 'Codice non valido o scaduto' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Email verification verify error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Get verification status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const status = await EmailVerificationService.getVerificationStatus(
      session.user.id
    );

    return NextResponse.json({
      ...status,
      message: status.isVerified ? 'Email già verificata' : 'Email non verificata'
    });

  } catch (error) {
    console.error('Email verification status error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
