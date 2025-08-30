import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL;

    return NextResponse.json({
      hasPublicKey: !!vapidPublic,
      hasPrivateKey: !!vapidPrivate,
      hasEmail: !!vapidEmail,
      publicKeyLength: vapidPublic?.length || 0,
      environment: process.env.NODE_ENV,
      // NON mostriamo mai le chiavi reali per sicurezza
      publicKeyPreview: vapidPublic ? `${vapidPublic.substring(0, 10)}...` : 'missing'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Errore controllando variabili VAPID',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
