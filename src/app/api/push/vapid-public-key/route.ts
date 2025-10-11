import { NextResponse } from 'next/server';

// GET - Restituisce la chiave pubblica VAPID per il client
export async function GET() {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      console.error('❌ NEXT_PUBLIC_VAPID_PUBLIC_KEY non configurata!');
      return NextResponse.json(
        { error: 'VAPID public key non configurata' },
        { status: 500 }
      );
    }

    console.log('✅ VAPID public key richiesta, inviata con successo');

    return NextResponse.json({
      publicKey: vapidPublicKey
    });

  } catch (error: any) {
    console.error('❌ Errore recupero VAPID public key:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero della chiave pubblica' },
      { status: 500 }
    );
  }
}
