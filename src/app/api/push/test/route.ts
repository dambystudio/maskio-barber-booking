// API di test per inviare notifica push al tuo account
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    console.log('🔍 Cerco il tuo account:', session.user.email);

    // Trova il tuo account
    const user = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, 'davide431@outlook.it'))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Account non trovato' },
        { status: 404 }
      );
    }

    console.log('👤 Account trovato:', user[0]);

    // Trova le subscription per il tuo account
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user[0].id));

    console.log('📱 Subscription trovate:', subscriptions.length);

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Nessuna subscription trovata. Devi prima attivare le notifiche dal browser.' },
        { status: 404 }
      );
    }

    // Crea notifica di test
    const notification = {
      title: '🎉 Test Notifica Push!',
      body: 'Questa è una notifica di test per il sistema di prenotazioni barbiere. Funziona perfettamente!',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'test',
        timestamp: Date.now(),
        message: 'Sistema di notifiche attivo!'
      },
      actions: [
        {
          action: 'view',
          title: '👀 Visualizza'
        },
        {
          action: 'dismiss',
          title: '❌ Chiudi'
        }
      ]
    };

    const payload = JSON.stringify(notification);

    // Invia notifica a tutte le subscription
    const results = [];
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload);
        
        results.push({ success: true, subscriptionId: sub.id });
        console.log(`✅ Notifica inviata a subscription: ${sub.id}`);
        
      } catch (error: any) {
        console.error(`❌ Errore inviando a ${sub.id}:`, error.message);
        results.push({ success: false, subscriptionId: sub.id, error: error.message });
        
        // Se subscription non valida, rimuovila
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
          console.log(`🗑️ Subscription invalida rimossa: ${sub.id}`);
        }
      }
    }

    const successful = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Test completato! Notifica inviata a ${successful} dispositivi`,
      user: {
        email: user[0].email,
        id: user[0].id
      },
      subscriptions: subscriptions.length,
      results
    });

  } catch (error) {
    console.error('❌ Errore nel test:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
