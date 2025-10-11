import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkPushSubscription() {
  console.log('🔍 VERIFICA PUSH SUBSCRIPTION\n');
  console.log('═'.repeat(60));
  
  // Trova test user
  const [testUser] = await sql`
    SELECT id, email, name FROM users WHERE email = 'test@gmail.com'
  `;
  
  if (!testUser) {
    console.log('❌ Utente test@gmail.com non trovato!\n');
    return;
  }
  
  console.log(`\n👤 Utente: ${testUser.name || 'Account Test'}`);
  console.log(`📧 Email: ${testUser.email}`);
  console.log(`🆔 ID: ${testUser.id}\n`);
  
  // Cerca push subscription
  const subscriptions = await sql`
    SELECT * FROM push_subscriptions
    WHERE user_id = ${testUser.id}
  `;
  
  console.log(`📱 Push Subscriptions trovate: ${subscriptions.length}\n`);
  
  if (subscriptions.length === 0) {
    console.log('❌ NESSUNA PUSH SUBSCRIPTION ATTIVA!\n');
    console.log('👉 Cosa fare:\n');
    console.log('   1. Vai su https://dominical-kenneth-gasifiable.ngrok-free.dev/debug-push');
    console.log('   2. Clicca su "Crea Subscription"');
    console.log('   3. Accetta i permessi notifiche');
    console.log('   4. Riprova\n');
  } else {
    subscriptions.forEach((sub, i) => {
      console.log(`Subscription ${i + 1}:`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
      console.log(`   Creata: ${new Date(sub.created_at).toLocaleString('it-IT')}`);
      console.log(`   User Agent: ${sub.user_agent || 'N/A'}`);
      console.log('');
    });
    console.log('✅ Push subscription attiva!\n');
  }
  
  // Verifica waitlist
  const [waitlistEntry] = await sql`
    SELECT * FROM waitlist
    WHERE user_id = ${testUser.id}
      AND barber_id = 'michele'
      AND date = '2025-12-05'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  if (waitlistEntry) {
    console.log('📋 Stato Waitlist:');
    console.log(`   Status: ${waitlistEntry.status}`);
    console.log(`   Posizione: ${waitlistEntry.position}`);
    console.log(`   Creato: ${new Date(waitlistEntry.created_at).toLocaleString('it-IT')}\n`);
  } else {
    console.log('⚠️  Non sei in lista d\'attesa per Michele - 5 Dicembre\n');
  }
}

checkPushSubscription().catch(console.error);
