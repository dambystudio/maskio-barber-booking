import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { pushSubscriptions, users } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// GET - Controlla se l'utente ha già una subscription attiva
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { hasSubscription: false },
        { status: 200 }
      );
    }

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { hasSubscription: false },
        { status: 200 }
      );
    }

    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user[0].id))
      .limit(1);

    return NextResponse.json({
      hasSubscription: subscriptions.length > 0,
      count: subscriptions.length
    });

  } catch (error: any) {
    console.error('❌ Errore check subscription:', error);
    return NextResponse.json(
      { hasSubscription: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 === REGISTRAZIONE PUSH SUBSCRIPTION ===');
    
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ Utente non autenticato');
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    console.log('👤 Utente autenticato:', session.user.email);

    // Trova l'utente nel database
    const user = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      console.log(`❌ Utente ${session.user.email} non trovato nel database`);
      return NextResponse.json(
        { error: 'Utente non trovato nel database' },
        { status: 404 }
      );
    }

    const userId = user[0].id;
    console.log('🆔 User ID:', userId);

    // Estrai i dati della subscription dal body
    const subscriptionData = await request.json();
    console.log('📱 Dati subscription ricevuti:', {
      endpoint: subscriptionData.endpoint?.substring(0, 50) + '...',
      hasKeys: !!subscriptionData.keys,
      hasP256dh: !!subscriptionData.keys?.p256dh,
      hasAuth: !!subscriptionData.keys?.auth
    });

    if (!subscriptionData.endpoint || !subscriptionData.keys?.p256dh || !subscriptionData.keys?.auth) {
      console.log('❌ Dati subscription incompleti');
      return NextResponse.json(
        { error: 'Dati subscription incompleti' },
        { status: 400 }
      );
    }

    // Controlla se esiste già una subscription con lo stesso endpoint
    const existingSubscription = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, subscriptionData.endpoint)
        )
      )
      .limit(1);

    if (existingSubscription.length > 0) {
      console.log('ℹ️ Subscription già esistente, aggiorno...');
      
      // Aggiorna la subscription esistente
      await db
        .update(pushSubscriptions)
        .set({
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth
        })
        .where(eq(pushSubscriptions.id, existingSubscription[0].id));

      console.log('✅ Subscription aggiornata:', existingSubscription[0].id);

      return NextResponse.json({
        success: true,
        message: 'Subscription aggiornata con successo',
        subscriptionId: existingSubscription[0].id,
        action: 'updated'
      });
    }

    // Crea nuova subscription
    console.log('➕ Creo nuova subscription...');
    
    const newSubscription = await db
      .insert(pushSubscriptions)
      .values({
        userId: userId,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth
      })
      .returning({ id: pushSubscriptions.id });

    console.log('✅ Subscription creata con successo:', newSubscription[0].id);

    return NextResponse.json({
      success: true,
      message: 'Subscription registrata con successo',
      subscriptionId: newSubscription[0].id,
      action: 'created'
    });

  } catch (error: any) {
    console.error('❌ Errore registrazione subscription:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Errore nella registrazione della subscription',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Rimuove una subscription (quando l'utente disabilita le notifiche)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ === RIMOZIONE PUSH SUBSCRIPTION ===');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ DELETE: Non autenticato');
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      console.log('❌ DELETE: Utente non trovato');
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    console.log('👤 DELETE per utente:', session.user.email);

    // Prova a leggere il body (potrebbe essere vuoto)
    let endpoint: string | undefined;
    try {
      const body = await request.json();
      endpoint = body.endpoint;
    } catch (e) {
      // Body vuoto o non JSON - elimina tutte le subscriptions
      console.log('ℹ️ Nessun endpoint specificato, elimino tutte le subscriptions');
    }

    let result;
    
    if (endpoint) {
      // Elimina subscription specifica
      console.log('🗑️ Elimino subscription specifica:', endpoint.substring(0, 50) + '...');
      result = await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, user[0].id),
            eq(pushSubscriptions.endpoint, endpoint)
          )
        );
    } else {
      // Elimina TUTTE le subscriptions dell'utente
      console.log('🗑️ Elimino TUTTE le subscriptions dell\'utente');
      result = await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, user[0].id));
    }

    console.log('✅ Subscription(s) rimossa/e per:', session.user.email);

    return NextResponse.json({
      success: true,
      message: endpoint 
        ? 'Subscription rimossa con successo'
        : 'Tutte le subscriptions rimosse con successo'
    });

  } catch (error: any) {
    console.error('❌ Errore rimozione subscription:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Errore nella rimozione della subscription',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
