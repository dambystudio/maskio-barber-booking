import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { pushSubscriptions, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import webPush from 'web-push';

// Force Node.js runtime (web-push requires Node.js modules)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Verifica configurazione VAPID
if (!process.env.VAPID_EMAIL || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error('❌ [TEST] VAPID keys non configurate!');
  console.error('VAPID_EMAIL:', !!process.env.VAPID_EMAIL);
  console.error('VAPID_PUBLIC_KEY:', !!process.env.VAPID_PUBLIC_KEY);
  console.error('VAPID_PRIVATE_KEY:', !!process.env.VAPID_PRIVATE_KEY);
} else {
  console.log('✅ [TEST] VAPID keys configurate');
}

webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 [TEST] Inizio test notifica push');
    
    const session = await getServerSession(authOptions);
    console.log('🔵 [TEST] Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('❌ [TEST] Utente non autenticato');
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    console.log('🔵 [TEST] Cerco utente nel database...');
    const user = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    console.log('🔵 [TEST] Utente trovato:', user.length > 0 ? user[0].id : 'Nessuno');
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'Account non trovato' }, { status: 404 });
    }

    console.log('🔵 [TEST] Cerco subscriptions per user_id:', user[0].id);
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user[0].id));

    console.log('🔵 [TEST] Subscriptions trovate:', subscriptions.length);
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        error: 'Nessuna subscription trovata. Prova a ricaricare la pagina e attivare le notifiche.' 
      }, { status: 404 });
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
        console.log('📱 Invio a:', sub.endpoint.substring(0, 60) + '...');
        console.log('   Tipo:', 
          sub.endpoint.includes('fcm.googleapis') ? '🤖 Android/Chrome' :
          sub.endpoint.includes('web.push.apple') ? '🍎 iOS/Safari' :
          sub.endpoint.includes('mozilla') ? '🦊 Firefox' : '❓'
        );
        
        const result = await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, JSON.stringify(notification));
        
        console.log('✅ Inviato con successo:', result.statusCode);
        results.push({ success: true, subscriptionId: sub.id, statusCode: result.statusCode });
      } catch (error: any) {
        console.error('❌ Errore invio a subscription:', sub.id);
        console.error('   StatusCode:', error.statusCode);
        console.error('   Message:', error.message);
        console.error('   Body:', error.body);
        
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log('🗑️ Subscription scaduta, rimuovo dal database...');
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          console.log('✅ Subscription rimossa:', sub.id);
        }
        results.push({ 
          success: false, 
          subscriptionId: sub.id,
          error: error.message,
          statusCode: error.statusCode 
        });
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
