import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { VerificationService } from '../../../../lib/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, isSignupFlow } = body;

    console.log(`🔍 Verify SMS API called:`, { code, userId, isSignupFlow });

    if (!code) {
      return NextResponse.json(
        { error: 'Codice di verifica richiesto' },
        { status: 400 }
      );
    }

    let effectiveUserId: string;

    if (isSignupFlow && userId) {
      // Durante signup, usiamo l'userId temporaneo passato dal frontend
      effectiveUserId = userId;
      console.log(`🔍 Using signup flow with userId: ${effectiveUserId}`);
    } else {
      // Per utenti autenticati, controlliamo la sessione
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Non autorizzato' },
          { status: 401 }
        );
      }
      effectiveUserId = session.user.id as string;
      console.log(`🔍 Using authenticated session with userId: ${effectiveUserId}`);
    }

    // Verify SMS code
    const isValid = await VerificationService.verifyPhoneCode(
      effectiveUserId,
      code
    );

    if (isValid) {
      return NextResponse.json({
        message: 'Numero di telefono verificato con successo',
        verified: true
      });
    } else {
      return NextResponse.json(
        { error: 'Codice di verifica non valido o scaduto' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error in verify-sms API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
