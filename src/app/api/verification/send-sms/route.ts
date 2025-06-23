import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { VerificationService } from '../../../../lib/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, userId, isSignupFlow } = body;

    console.log(`📱 Send SMS API called:`, { phone, userId, isSignupFlow });

    if (!phone) {
      return NextResponse.json(
        { error: 'Numero di telefono richiesto' },
        { status: 400 }
      );
    }

    let effectiveUserId: string;

    if (isSignupFlow && userId) {
      // Durante signup, usiamo l'userId temporaneo passato dal frontend
      effectiveUserId = userId;
      console.log(`📱 Using signup flow with userId: ${effectiveUserId}`);
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
      console.log(`📱 Using authenticated session with userId: ${effectiveUserId}`);
    }

    // Validate phone format (flexible for testing - USA and Italy)
    const phoneRegex = /^\+(\d{1,3})\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Formato numero di telefono non valido. Usa formato internazionale: +XX XXX XXX XXXX' },
        { status: 400 }
      );
    }    // Send SMS verification
    const result = await VerificationService.sendSMSVerification(
      effectiveUserId,
      phone
    );

    if (result.success) {
      return NextResponse.json({
        message: 'SMS di verifica inviato con successo',
        phone: phone,
        rateLimitInfo: result.rateLimitInfo
      });
    } else {
      // Handle rate limit or other errors
      const status = result.error?.includes('Troppi tentativi') ? 429 : 500;
      return NextResponse.json(
        { 
          error: result.error || 'Errore nell\'invio del SMS. Riprova più tardi.',
          rateLimitInfo: result.rateLimitInfo
        },
        { status }
      );
    }

  } catch (error: any) {
    console.error('Error in send-sms API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
