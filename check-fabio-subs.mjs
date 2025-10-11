import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkFabioSubscriptions() {
  try {
    console.log('🔍 Controllo subscriptions per Fabio...\n');

    // Trova Fabio
    const fabio = await sql`
      SELECT id, name, email, role 
      FROM users 
      WHERE email = 'fabio.cassano97@icloud.com'
    `;

    if (fabio.length === 0) {
      console.log('❌ Utente Fabio non trovato');
      return;
    }

    console.log('✅ Utente trovato:', fabio[0].name);
    console.log('   Email:', fabio[0].email);
    console.log('   ID:', fabio[0].id);
    console.log();

    // Trova le subscriptions
    const subscriptions = await sql`
      SELECT * FROM push_subscriptions
      WHERE user_id = ${fabio[0].id}
      ORDER BY created_at DESC
    `;

    console.log(`📱 Subscriptions trovate: ${subscriptions.length}\n`);

    subscriptions.forEach((sub, index) => {
      console.log(`Subscription #${index + 1}:`);
      console.log(`   ID: ${sub.id}`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 70)}...`);
      console.log(`   Created: ${sub.created_at}`);
      console.log(`   User Agent: ${sub.user_agent || 'N/A'}`);
      
      if (sub.endpoint.includes('fcm.googleapis.com')) {
        console.log(`   Tipo: 🤖 Android/Chrome`);
      } else if (sub.endpoint.includes('web.push.apple.com')) {
        console.log(`   Tipo: 🍎 iOS/Safari`);
      } else if (sub.endpoint.includes('updates.push.services.mozilla.com')) {
        console.log(`   Tipo: 🦊 Firefox`);
      } else {
        console.log(`   Tipo: ❓ Sconosciuto`);
      }
      console.log();
    });

    // Test di invio notifica
    console.log('\n🧪 Test invio notifica...');
    console.log('(Assicurati che le VAPID keys siano configurate)\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkFabioSubscriptions();
