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
    const { phone, method = 'auto' } = body; // auto, sms, whatsapp

    if (!phone) {
      return NextResponse.json(
        { error: 'Numero di telefono richiesto' },
        { status: 400 }
      );
    }

    // Validate phone format (Italian format)
    const phoneRegex = /^\+39\s?\d{3}\s?\d{3}\s?\d{4}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Formato numero di telefono non valido. Usa formato: +39 XXX XXX XXXX' },
        { status: 400 }
      );
    }

    let result;

    // Handle different methods
    switch (method) {
      case 'sms':
        result = await N8NVerificationService.sendSMSVerification(
          session.user.id as string,
          phone
        );
        break;
        
      case 'whatsapp':
        result = await N8NVerificationService.sendWhatsAppVerification(
          session.user.id as string,
          phone
        );
        break;
        
      case 'auto':
      default:
        // Try WhatsApp first, fallback to SMS
        const autoResult = await N8NVerificationService.sendVerificationWithFallback(
          session.user.id as string,
          phone
        );
        
        if (autoResult.success) {
          return NextResponse.json({
            message: autoResult.message,
            phone: phone,
            method: autoResult.method,
            provider: 'n8n'
          });
        } else {
          return NextResponse.json(
            { error: autoResult.message },
            { status: 500 }
          );
        }
    }

    // Handle simple boolean result (for direct method calls)
    if (typeof result === 'boolean') {
      if (result) {
        return NextResponse.json({
          message: `${method === 'sms' ? 'SMS' : 'Messaggio WhatsApp'} di verifica inviato con successo`,
          phone: phone,
          method: method,
          provider: 'n8n'
        });
      } else {
        return NextResponse.json(
          { error: `Errore nell'invio ${method === 'sms' ? 'SMS' : 'WhatsApp'}. Riprova più tardi.` },
          { status: 500 }
        );
      }
    }

  } catch (error: any) {
    console.error('Error in send-verification-n8n API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
