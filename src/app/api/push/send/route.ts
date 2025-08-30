// API per inviare notifiche push
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { pushSubscriptions, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import webPush from 'web-push';

// Configura VAPID una volta
webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Solo admin e barbieri possono inviare notifiche
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0] || !['admin', 'barber'].includes(user[0].role)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const { targetUserId, notification } = await request.json() as {
      targetUserId?: string;
      notification: NotificationPayload;
    };

    console.log('📢 Invio notifica:', { targetUserId, notification });

    // Ottieni le subscription da notificare
    let subscriptions;
    if (targetUserId) {
      // Notifica a utente specifico
      subscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, targetUserId));
    } else {
      // Notifica a tutti (solo admin)
      if (user[0].role !== 'admin') {
        return NextResponse.json(
          { error: 'Solo admin può inviare notifiche a tutti' },
          { status: 403 }
        );
      }
      
      subscriptions = await db
        .select()
        .from(pushSubscriptions);
    }

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Nessuna subscription trovata' },
        { status: 404 }
      );
    }

    // Prepara il payload
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      data: notification.data || {},
      actions: notification.actions || []
    });

    // Invia notifiche
    const promises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload);
        
        return { success: true, subscriptionId: sub.id };
      } catch (error: any) {
        console.error(`❌ Errore inviando a ${sub.id}:`, error.message);
        
        // Se subscription non valida, rimuovila
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
          console.log(`🗑️ Subscription invalida rimossa: ${sub.id}`);
        }
        
        return { success: false, subscriptionId: sub.id, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Notifiche inviate: ${successful} successo, ${failed} fallite`);

    return NextResponse.json({
      success: true,
      message: `Notifica inviata a ${successful} dispositivi`,
      results: {
        total: subscriptions.length,
        successful,
        failed,
        details: results
      }
    });

  } catch (error) {
    console.error('❌ Errore inviando notifiche:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
