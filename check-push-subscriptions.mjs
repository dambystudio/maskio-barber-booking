// Script per verificare le subscription push nel database
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkSubscriptions() {
  console.log('🔍 === VERIFICA PUSH SUBSCRIPTIONS ===\n');
  
  try {
    // Trova l'utente davide431@outlook.it
    const user = await sql`
      SELECT id, name, email, role 
      FROM users 
      WHERE email = 'davide431@outlook.it'
    `;
    
    if (user.length === 0) {
      console.log('❌ Utente davide431@outlook.it non trovato');
      return;
    }
    
    console.log('✅ Utente trovato:');
    console.log(`   ID: ${user[0].id}`);
    console.log(`   Nome: ${user[0].name}`);
    console.log(`   Email: ${user[0].email}`);
    console.log(`   Ruolo: ${user[0].role}\n`);
    
    // Cerca subscription push per questo utente
    const subscriptions = await sql`
      SELECT * FROM push_subscriptions 
      WHERE user_id = ${user[0].id}
      ORDER BY created_at DESC
    `;
    
    console.log(`📱 Subscription trovate: ${subscriptions.length}\n`);
    
    if (subscriptions.length === 0) {
      console.log('ℹ️  Nessuna subscription trovata per questo utente');
      console.log('💡 Devi attivare le notifiche dal browser prima\n');
      return;
    }
    
    // Mostra dettagli subscription
    subscriptions.forEach((sub, index) => {
      console.log(`\n📲 Subscription #${index + 1}:`);
      console.log(`   ID: ${sub.id}`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
      console.log(`   User Agent: ${sub.user_agent}`);
      console.log(`   Creata: ${sub.created_at}`);
      console.log(`   Aggiornata: ${sub.updated_at}`);
      console.log(`   Ha p256dh: ${!!sub.p256dh}`);
      console.log(`   Ha auth: ${!!sub.auth}`);
    });
    
    console.log('\n✅ Verifica completata!');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

checkSubscriptions();
