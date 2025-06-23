import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { N8NVerificationService } from '../../../../lib/verification-n8n';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Codice di verifica richiesto' },
        { status: 400 }
      );
    }

    // Verify code with N8N service
    const isValid = await N8NVerificationService.verifyPhoneCode(
      session.user.id as string,
      code
    );

    if (isValid) {
      // Get verification info for response
      const verificationInfo = N8NVerificationService.getVerificationInfo(session.user.id as string);
      
      return NextResponse.json({
        message: 'Numero di telefono verificato con successo',
        verified: true,
        method: verificationInfo?.method || 'unknown'
      });
    } else {
      return NextResponse.json(
        { error: 'Codice di verifica non valido o scaduto' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error in verify-n8n API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
