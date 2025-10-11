// Controlla subscriptions correnti nel database
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkSubscriptions() {
  console.log('🔍 === CHECK SUBSCRIPTIONS CORRENTI ===\n');

  try {
    const subs = await sql`
      SELECT ps.*, u.email, u.name
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      ORDER BY ps.created_at DESC
    `;

    console.log(`📊 Totale subscriptions: ${subs.length}\n`);

    if (subs.length === 0) {
      console.log('❌ NESSUNA SUBSCRIPTION NEL DATABASE!');
      console.log('\n🔍 Possibile causa:');
      console.log('   - La subscription non è stata salvata dopo l\'attivazione');
      console.log('   - Errore durante POST /api/push/subscribe');
      console.log('   - Database vuoto dopo reset\n');
      return;
    }

    subs.forEach((sub, i) => {
      const isApple = sub.endpoint.includes('web.push.apple');
      const isFCM = sub.endpoint.includes('fcm.googleapis');
      const age = ((new Date() - new Date(sub.created_at)) / (1000 * 60)).toFixed(1);
      
      console.log(`${i + 1}. ${sub.name || 'N/A'} (${sub.email})`);
      console.log(`   ID: ${sub.id}`);
      console.log(`   Tipo: ${isApple ? '🍎 iOS/Safari' : isFCM ? '🤖 Android/Chrome' : '❓'}`);
      console.log(`   Created: ${sub.created_at}`);
      console.log(`   Età: ${age} minuti fa`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 60)}...`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

checkSubscriptions();
