import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { pushSubscriptions, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import webPush from 'web-push';

// Configura VAPID
webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 === TEST NOTIFICA SEMPLICE ===');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Trova account
    const user = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, 'davide431@outlook.it'))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'Account non trovato' }, { status: 404 });
    }

    // Trova subscription più recente
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user[0].id))
      .orderBy(pushSubscriptions.createdAt);

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'Nessuna subscription' }, { status: 404 });
    }

    const latestSub = subscriptions[subscriptions.length - 1];
    console.log('📱 Uso subscription più recente:', {
      id: latestSub.id,
      createdAt: latestSub.createdAt,
      endpoint: latestSub.endpoint.substring(0, 50) + '...'
    });

    // Notifica molto semplice
    const notification = {
      title: '🚨 NOTIFICA TEST URGENTE',
      body: 'Se vedi questo messaggio, le notifiche funzionano!',
      icon: '/icon-192x192.png',
      tag: 'test-' + Date.now(),
      requireInteraction: true,
      data: {
        url: 'https://www.maskiobarberconcept.it',
        test: true
      }
    };

    console.log('📤 Invio notifica semplice...');
    
    try {
      const result = await webPush.sendNotification({
        endpoint: latestSub.endpoint,
        keys: {
          p256dh: latestSub.p256dh,
          auth: latestSub.auth
        }
      }, JSON.stringify(notification));
      
      console.log('✅ Invio completato:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Notifica semplice inviata!',
        subscription: {
          id: latestSub.id,
          createdAt: latestSub.createdAt
        },
        notification: notification.title
      });
      
    } catch (error: any) {
      console.error('❌ Errore invio:', error);
      
      return NextResponse.json({
        success: false,
        error: error.message,
        statusCode: error.statusCode,
        details: 'Subscription probabilmente scaduta'
      });
    }

  } catch (error: any) {
    console.error('❌ Errore generale:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
