import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import webpush from 'web-push';

const sql = neon(process.env.DATABASE_URL!);

// Configura VAPID keys
webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

/**
 * API per inviare notifiche push a un utente specifico
 * POST /api/push/notify
 * 
 * Body: {
 *   userId: string,
 *   notification: {
 *     title: string,
 *     body: string,
 *     icon?: string,
 *     badge?: string,
 *     data?: any,
 *     actions?: Array<{action: string, title: string}>
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, notification } = await request.json();

    if (!userId || !notification) {
      return NextResponse.json(
        { error: 'userId e notification sono richiesti' },
        { status: 400 }
      );
    }

    console.log(`📤 [PUSH] Invio notifica a user ${userId}`);

    // 1. Recupera tutte le subscriptions dell'utente
    const subscriptions = await sql`
      SELECT id, endpoint, p256dh, auth, user_agent
      FROM push_subscriptions
      WHERE user_id = ${userId}
    `;

    if (subscriptions.length === 0) {
      console.log(`⚠️  [PUSH] User ${userId}: nessuna subscription trovata`);
      return NextResponse.json({
        success: false,
        error: 'Nessuna push subscription trovata per questo utente',
        sent: 0,
      });
    }

    console.log(`   📋 Trovate ${subscriptions.length} subscription(s)`);

    // 2. Invia notifica a tutte le subscriptions
    const results = [];
    let successCount = 0;
    let errorCount = 0;

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
          JSON.stringify(notification)
        );

        console.log(`   ✅ Inviata a: ${sub.user_agent || 'unknown device'}`);
        successCount++;
        results.push({
          subscriptionId: sub.id,
          success: true,
        });

      } catch (error: any) {
        console.error(`   ❌ Errore per subscription ${sub.id}:`, error.message);
        
        // Se subscription è scaduta o invalida (410 Gone), rimuovila
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`   🗑️  Rimuovo subscription scaduta: ${sub.id}`);
          await sql`
            DELETE FROM push_subscriptions
            WHERE id = ${sub.id}
          `;
        }
        
        errorCount++;
        results.push({
          subscriptionId: sub.id,
          success: false,
          error: error.message,
          statusCode: error.statusCode,
        });
      }
    }

    console.log(`   📊 Risultato: ${successCount} inviate, ${errorCount} errori`);

    return NextResponse.json({
      success: successCount > 0,
      message: `Notifica inviata a ${successCount}/${subscriptions.length} dispositivi`,
      sent: successCount,
      errors: errorCount,
      totalSubscriptions: subscriptions.length,
      results,
    });

  } catch (error) {
    console.error('❌ [PUSH] Errore:', error);
    return NextResponse.json(
      { 
        error: 'Errore invio notifica push',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
