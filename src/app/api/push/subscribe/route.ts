import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, pushSubscriptions } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Dati subscription mancanti' },
        { status: 400 }
      );
    }

    // Trova l'utente
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const userId = user[0].id;

    // Controlla se esiste già una subscription con questo endpoint
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    let subscriptionId: string;

    if (existing && existing.length > 0) {
      // Aggiorna subscription esistente
      await db
        .update(pushSubscriptions)
        .set({
          userId: userId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: request.headers.get('user-agent') || '',
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.endpoint, endpoint));

      subscriptionId = existing[0].id;
    } else {
      // Crea nuova subscription
      const newSub = await db
        .insert(pushSubscriptions)
        .values({
          userId: userId,
          endpoint: endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: request.headers.get('user-agent') || '',
        })
        .returning({ id: pushSubscriptions.id });

      subscriptionId = newSub[0].id;
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscriptionId,
      message: 'Subscription salvata con successo',
    });
  } catch (error: any) {
    console.error('Errore salvataggio subscription:', error);
    return NextResponse.json(
      { error: 'Errore durante il salvataggio', details: error.message },
      { status: 500 }
    );
  }
}
