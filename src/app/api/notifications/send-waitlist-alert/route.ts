import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import webpush from 'web-push';

const sql = neon(process.env.DATABASE_URL!);

// Configura VAPID
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { bookingId, barberId, date, time } = await request.json();

    console.log('🔔 Invio notifiche waitlist per:', { bookingId, barberId, date, time });

    // Trova gli utenti in waitlist per quella data e barbiere (in ordine di posizione)
    const waitlistUsers = await sql`
      SELECT w.*, u.name as user_name, u.email as user_email
      FROM waitlist w
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.date = ${date}
      AND w.barber_id = ${barberId}
      AND w.status = 'waiting'
      ORDER BY w.position ASC
      LIMIT 1
    `;

    if (waitlistUsers.length === 0) {
      console.log('📭 Nessun utente in waitlist per questa data/barbiere');
      return NextResponse.json({ 
        success: true, 
        message: 'Nessun utente in waitlist da notificare' 
      });
    }

    const waitlistUser = waitlistUsers[0];
    console.log('👤 Utente da notificare:', waitlistUser.customer_name, waitlistUser.customer_email);

    // Aggiorna lo status della waitlist a 'offered' e salva i dettagli dell'offerta
    await sql`
      UPDATE waitlist 
      SET status = 'offered', 
          offered_time = ${time},
          offered_booking_id = ${bookingId},
          offer_expires_at = NOW() + INTERVAL '24 hours',
          updated_at = NOW()
      WHERE id = ${waitlistUser.id}
    `;

    // Cerca le sottoscrizioni push dell'utente
    const subscriptions = await sql`
      SELECT * FROM push_subscriptions 
      WHERE user_id = ${waitlistUser.user_id}
    `;

    console.log(`📱 Sottoscrizioni trovate: ${subscriptions.length}`);

    if (subscriptions.length === 0) {
      console.log('⚠️ Utente non ha sottoscrizioni push attive');
      return NextResponse.json({ 
        success: true, 
        message: 'Offerta creata ma utente non ha notifiche attive' 
      });
    }

    // Prepara il payload della notifica
    const notificationPayload = {
      title: '🎉 Posto Disponibile!',
      body: `Si è liberato un posto per il ${new Date(date).toLocaleDateString('it-IT', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      })} alle ${time}. Conferma entro 24 ore!`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        url: '/area-personale/profilo',
        waitlistId: waitlistUser.id,
        date: date,
        time: time,
        barberName: waitlistUser.barber_name
      }
    };

    // Invia notifiche a tutte le sottoscrizioni dell'utente
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationPayload)
        );

        console.log('✅ Notifica inviata con successo a subscription:', sub.id.substring(0, 8));
        return { success: true, subscriptionId: sub.id };
      } catch (error: any) {
        console.error('❌ Errore invio notifica:', error);
        
        // Se la sottoscrizione è scaduta o non valida, rimuovila
        if (error.statusCode === 410 || error.statusCode === 404) {
          await sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`;
          console.log('🗑️ Sottoscrizione rimossa (scaduta):', sub.id.substring(0, 8));
        }
        
        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`📊 Notifiche inviate: ${successCount}/${subscriptions.length}`);

    return NextResponse.json({
      success: true,
      message: `Notifica inviata a ${waitlistUser.customer_name}`,
      sentTo: successCount,
      totalSubscriptions: subscriptions.length,
      waitlistId: waitlistUser.id
    });

  } catch (error) {
    console.error('❌ Errore nell\'invio notifiche waitlist:', error);
    return NextResponse.json({ 
      error: 'Errore nell\'invio delle notifiche' 
    }, { status: 500 });
  }
}
