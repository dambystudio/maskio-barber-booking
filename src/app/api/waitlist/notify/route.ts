import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * API per notificare TUTTI gli utenti in lista d'attesa quando uno slot si libera
 * POST /api/waitlist/notify
 * 
 * Body: { barberId: string, date: string }
 * 
 * Sistema "first come, first served":
 * 1. Trova TUTTI gli utenti in lista per quel barbiere/data
 * 2. Invia notifica push a TUTTI (broadcast)
 * 3. Chi prenota per primo si prende il posto
 * 4. Non ci sono offerte o scadenze individuali
 */
export async function POST(request: NextRequest) {
  try {
    const { barberId, date } = await request.json();

    if (!barberId || !date) {
      return NextResponse.json(
        { error: 'Parametri mancanti: barberId e date richiesti' },
        { status: 400 }
      );
    }

    console.log(`\n🔔 [WAITLIST] Slot liberato: ${barberId} - ${date}`);
    console.log(`   Cerco TUTTI gli utenti in lista d'attesa...`);

    // 1. Trova TUTTI gli utenti in attesa per questo barbiere e data
    const waitingUsers = await sql`
      SELECT 
        w.*,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name
      FROM waitlist w
      INNER JOIN users u ON w.user_id = u.id
      WHERE w.barber_id = ${barberId}
        AND w.date = ${date}
        AND w.status = 'waiting'
      ORDER BY w.created_at ASC
    `;

    console.log(`   📋 Trovati ${waitingUsers.length} utenti in lista`);

    if (waitingUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nessun utente in lista d\'attesa',
        notified: 0,
      });
    }

    // 2. Prepara notifica (uguale per tutti)
    // Format date safely (YYYY-MM-DD -> DD month)
    const [year, month, day] = date.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const formattedDate = dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
    
    const notificationPayload = {
      title: '🎉 Posto Disponibile!',
      body: `${waitingUsers[0].barber_name} ha posti disponibili il ${formattedDate}. Prenota subito!`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `waitlist-${barberId}-${date}`,
      data: {
        url: `/prenota?barber=${barberId}&date=${date}`,
        type: 'waitlist_slot_available',
        barberId,
        date,
      },
      actions: [
        { action: 'book', title: '📅 Prenota Ora' },
        { action: 'dismiss', title: 'Ignora' },
      ],
      requireInteraction: true,
    };

    console.log(`   📤 Invio notifica a ${waitingUsers.length} utenti...`);

    // 3. Invia notifica a TUTTI gli utenti
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const user of waitingUsers) {
      try {
        const pushResponse = await fetch(`${request.nextUrl.origin}/api/push/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.user_id,
            notification: notificationPayload,
          }),
        });

        const pushResult = await pushResponse.json();

        if (pushResponse.ok) {
          console.log(`   ✅ ${user.user_name || user.customer_name} - Inviata`);
          successCount++;
          results.push({
            userId: user.user_id,
            name: user.user_name || user.customer_name,
            success: true,
          });
        } else {
          console.log(`   ❌ ${user.user_name || user.customer_name} - Errore: ${pushResult.error}`);
          errorCount++;
          results.push({
            userId: user.user_id,
            name: user.user_name || user.customer_name,
            success: false,
            error: pushResult.error,
          });
        }
      } catch (error) {
        console.error(`   ❌ ${user.user_name || user.customer_name} - Eccezione:`, error);
        errorCount++;
        results.push({
          userId: user.user_id,
          name: user.user_name || user.customer_name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`   📊 Risultato: ${successCount} inviate, ${errorCount} errori`);

    // 4. Aggiorna stato waitlist (opzionale - segna come notificati)
    await sql`
      UPDATE waitlist
      SET 
        status = 'notified',
        updated_at = NOW()
      WHERE barber_id = ${barberId}
        AND date = ${date}
        AND status = 'waiting'
    `;

    return NextResponse.json({
      success: true,
      message: `Notifica inviata a ${successCount} utenti`,
      notified: successCount,
      errors: errorCount,
      totalInWaitlist: waitingUsers.length,
      results,
      slot: {
        barberId,
        date,
      },
    });

  } catch (error) {
    console.error('❌ [WAITLIST] Errore:', error);
    return NextResponse.json(
      { 
        error: 'Errore invio notifiche waitlist',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
