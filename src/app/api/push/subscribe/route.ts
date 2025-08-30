// API per gestire le subscription delle notifiche push
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { pushSubscriptions } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const subscription = await request.json();
    console.log('📱 Ricevuta subscription push:', subscription);

    // Verifica che la subscription sia valida
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: 'Subscription non valida' },
        { status: 400 }
      );
    }

    // Elimina subscription esistenti per questo utente (per evitare duplicati)
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, session.user.id));

    // Salva la nuova subscription
    const newSubscription = await db
      .insert(pushSubscriptions)
      .values({
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: request.headers.get('user-agent') || 'Unknown'
      })
      .returning();

    console.log('✅ Subscription salvata:', newSubscription[0].id);

    return NextResponse.json({
      success: true,
      message: 'Notifiche attivate con successo!',
      subscriptionId: newSubscription[0].id
    });

  } catch (error) {
    console.error('❌ Errore salvando subscription:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Rimuovi tutte le subscription per questo utente
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, session.user.id));

    console.log('🔕 Subscription rimosse per utente:', session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Notifiche disattivate'
    });

  } catch (error) {
    console.error('❌ Errore rimuovendo subscription:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
