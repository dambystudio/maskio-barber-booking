// API di test per inviare noti    console.log('📧 Email sessione:', session.user.email);
    console.log('🔍 Cerco il tuo account:', session.user.email);

    // Trova l'account dell'utente corrente
    const user = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    console.log('👥 Utenti trovati:', user.length);

    if (user.length === 0) {
      console.log(`❌ Account ${session.user.email} non trovato nel database`);
      return NextResponse.json(
        { error: 'Account non trovato nel database' },
        { status: 404 }
      );
    }count
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
    console.log('🧪 === TEST API NOTIFICHE PUSH ===');
    
    const session = await getServerSession(authOptions);
    console.log('🔐 Session:', session ? 'Presente' : 'Mancante');
    
    if (!session?.user?.email) {
      console.log('❌ Utente non autenticato');
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    console.log('� Email sessione:', session.user.email);
    console.log('�🔍 Cerco il tuo account: davide431@outlook.it');

    // Trova il tuo account
    const user = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.email, 'davide431@outlook.it'))
      .limit(1);

    console.log('👥 Utenti trovati:', user.length);

    if (user.length === 0) {
      console.log('❌ Account davide431@outlook.it non trovato nel database');
      return NextResponse.json(
        { error: 'Account non trovato nel database' },
        { status: 404 }
      );
    }

    console.log('👤 Account trovato:', { id: user[0].id, email: user[0].email, role: user[0].role });

    // Trova le subscription per il tuo account
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user[0].id));

    console.log('📱 Subscription trovate:', subscriptions.length);
    console.log('📋 Dettagli subscription:', subscriptions.map(s => ({
      id: s.id,
      endpoint: s.endpoint.substring(0, 50) + '...',
      hasP256dh: !!s.p256dh,
      hasAuth: !!s.auth,
      createdAt: s.createdAt
    })));

    if (subscriptions.length === 0) {
      console.log('❌ Nessuna subscription push trovata per questo account');
      return NextResponse.json(
        { error: 'Nessuna subscription trovata. Devi prima attivare le notifiche dal browser.' },
        { status: 404 }
      );
    }

    // Controlla configurazione VAPID
    console.log('🔑 Controllo configurazione VAPID...');
    console.log('📧 VAPID_EMAIL:', !!process.env.VAPID_EMAIL);
    console.log('🔑 VAPID_PUBLIC_KEY:', !!process.env.VAPID_PUBLIC_KEY);
    console.log('🗝️ VAPID_PRIVATE_KEY:', !!process.env.VAPID_PRIVATE_KEY);

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
    console.log('📤 Inizio invio notifiche...');
    const results = [];
    
    for (const sub of subscriptions) {
      try {
        console.log(`📱 Invio a subscription ${sub.id}...`);
        
        const pushResult = await webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload);
        
        console.log(`✅ Notifica inviata con successo a ${sub.id}:`, pushResult);
        results.push({ success: true, subscriptionId: sub.id });
        
      } catch (error: any) {
        console.error(`❌ Errore inviando a ${sub.id}:`, {
          message: error.message,
          statusCode: error.statusCode,
          body: error.body,
          stack: error.stack
        });
        
        results.push({ 
          success: false, 
          subscriptionId: sub.id, 
          error: error.message,
          statusCode: error.statusCode 
        });
        
        // Se subscription non valida, rimuovila
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`🗑️ Rimuovo subscription invalida: ${sub.id}`);
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
          console.log(`✅ Subscription ${sub.id} rimossa dal database`);
        }
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(`📊 Risultato finale: ${successful}/${subscriptions.length} notifiche inviate`);

    return NextResponse.json({
      success: true,
      message: `Test completato! Notifica inviata a ${successful} dispositivi`,
      user: {
        email: user[0].email,
        id: user[0].id
      },
      subscriptions: subscriptions.length,
      results,
      debug: {
        vapidConfigured: !!(process.env.VAPID_EMAIL && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Errore generale nel test:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
