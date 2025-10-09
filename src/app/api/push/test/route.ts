import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, pushSubscriptions } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import webpush from 'web-push';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const user = await db
      .select({ id: users.id, email: users.email, role: users.role })
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

    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Nessuna sottoscrizione trovata' },
        { status: 404 }
      );
    }

    const results = [];

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: ' Test Notifica',
            body: 'Se vedi questo messaggio, le notifiche funzionano! ',
            icon: '/icon-192.png',
            badge: '/badge-72.png',
          })
        );

        results.push({ success: true, subscriptionId: sub.id });
      } catch (error: any) {
        console.error('Errore invio notifica:', error);
        results.push({ success: false, subscriptionId: sub.id, error: error.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `Test completato! Notifica inviata a ${successCount} dispositivi`,
      results,
    });
  } catch (error: any) {
    console.error('Errore test push:', error);
    return NextResponse.json(
      { error: 'Errore durante il test', details: error.message },
      { status: 500 }
    );
  }
}
