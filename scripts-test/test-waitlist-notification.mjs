#!/usr/bin/env node

/**
 * Test completo del sistema di notifiche waitlist
 * Simula uno slot che si libera e notifica gli utenti in coda
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

console.log('🧪 === TEST NOTIFICHE WAITLIST ===\n');

async function testWaitlistNotifications() {
  try {
    // Step 1: Trova tutti gli utenti con subscription attiva
    console.log('📱 Step 1: Cercando utenti con push subscription...');
    const subscriptions = await sql`
      SELECT 
        ps.id as subscription_id,
        ps.endpoint,
        u.email,
        u.name
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      WHERE ps.endpoint IS NOT NULL
      ORDER BY ps.created_at DESC
      LIMIT 5
    `;
    
    console.log(`✅ Trovate ${subscriptions.length} subscription attive\n`);
    
    if (subscriptions.length === 0) {
      console.log('❌ Nessuna subscription trovata!');
      console.log('👉 Vai su /debug-push e crea una subscription prima di testare.');
      return;
    }

    // Step 2: Mostra dettagli subscription
    console.log('📋 Subscription trovate:');
    subscriptions.forEach((sub, i) => {
      console.log(`   ${i + 1}. ${sub.name || sub.email}`);
      console.log(`      📧 Email: ${sub.email}`);
      console.log(`      🆔 ID: ${sub.subscription_id}`);
      console.log(`      🔗 Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      console.log('');
    });

    // Step 3: Simula uno slot che si libera
    console.log('🎯 Step 2: Simulando slot libero per "michele" il 5 dicembre 2025 alle 10:00\n');
    
    const waitlistPayload = {
      type: 'waitlist_slot_available',
      barberId: 'michele',
      date: '2025-12-05',
      time: '10:00',
      slotDetails: {
        barberName: 'Michele',
        formattedDate: 'Giovedì 5 Dicembre 2025',
        formattedTime: '10:00'
      }
    };

    console.log('📦 Payload notifica:');
    console.log(JSON.stringify(waitlistPayload, null, 2));
    console.log('');

    // Step 4: Invia notifiche via API
    console.log('📤 Step 3: Inviando notifiche tramite API...\n');
    
    const ngrokUrl = process.env.NGROK_URL || 'https://dominical-kenneth-gasifiable.ngrok-free.dev';
    const apiUrl = `${ngrokUrl}/api/push/notify`;
    
    console.log(`🔗 API URL: ${apiUrl}\n`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(waitlistPayload)
    });

    const result = await response.json();

    console.log(`📊 Risposta API (${response.status} ${response.statusText}):`);
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Step 5: Verifica risultati
    if (response.ok) {
      console.log('✅ NOTIFICHE INVIATE CON SUCCESSO!');
      console.log('');
      console.log('📱 Controlla i tuoi dispositivi per vedere le notifiche.');
      console.log('');
      console.log('🔍 Verifica nella console del browser:');
      console.log('   - Apri DevTools (F12)');
      console.log('   - Cerca i log: [SW-PUSH] PUSH EVENT RICEVUTO');
      console.log('');
      console.log('📊 Risultati:');
      console.log(`   - Dispositivi notificati: ${result.sent || 0}`);
      console.log(`   - Errori: ${result.failed || 0}`);
      
      if (result.results && result.results.length > 0) {
        console.log('');
        console.log('📋 Dettagli per subscription:');
        result.results.forEach((r, i) => {
          const status = r.success ? '✅' : '❌';
          console.log(`   ${i + 1}. ${status} Subscription: ${r.subscriptionId}`);
          if (r.error) {
            console.log(`      ⚠️ Errore: ${r.error}`);
          }
        });
      }
    } else {
      console.log('❌ ERRORE durante l\'invio delle notifiche!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Messaggio: ${result.error || 'Unknown error'}`);
    }

    console.log('');
    console.log('🎉 Test completato!');

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    console.error('');
    console.error('Stack trace:', error.stack);
  }
}

// Verifica variabili ambiente
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non configurata!');
  console.error('👉 Assicurati che il file .env.local esista e contenga DATABASE_URL');
  process.exit(1);
}

// Esegui test
testWaitlistNotifications();
