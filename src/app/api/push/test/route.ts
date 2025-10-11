import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { pushSubscriptions, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import webPush from 'web-push';

webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const user = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'Account non trovato' }, { status: 404 });
    }

    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user[0].id));

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'Nessuna subscription' }, { status: 404 });
    }

    const notification = {
      title: '🎉 Test Notifica Push!',
      body: `Ciao ${user[0].email}! Il sistema di notifiche funziona perfettamente!`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'test-notification',
      requireInteraction: false,
      data: {
        type: 'test',
        url: '/area-personale/profilo',
        timestamp: Date.now(),
        message: 'Test completato con successo!'
      }
    };

    console.log('📤 Invio notifiche a', subscriptions.length, 'dispositivi');

    const results = [];
    for (const sub of subscriptions) {
      try {
        console.log('📱 Invio a:', sub.endpoint.substring(0, 50) + '...');
        
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, JSON.stringify(notification));
        
        console.log('✅ Inviato con successo');
        results.push({ success: true, subscriptionId: sub.id });
      } catch (error: any) {
        console.error('❌ Errore invio:', error.message, error.statusCode);
        
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          console.log('🗑️ Subscription rimossa:', sub.id);
        }
        results.push({ success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Risultato: ${successCount}/${subscriptions.length} notifiche inviate`);

    return NextResponse.json({ 
      success: true, 
      message: `Notifica inviata a ${successCount} dispositivi`,
      results 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
