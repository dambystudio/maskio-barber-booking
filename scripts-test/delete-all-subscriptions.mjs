// Elimina TUTTE le subscriptions (da usare solo se necessario)
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function deleteAllSubscriptions() {
  console.log('⚠️  === ELIMINAZIONE TUTTE LE SUBSCRIPTIONS ===\n');
  console.log('🚨 ATTENZIONE: Questa operazione è IRREVERSIBILE!\n');

  try {
    // 1. Conta subscriptions esistenti
    const existing = await sql`
      SELECT COUNT(*) as count FROM push_subscriptions
    `;
    
    const totalCount = parseInt(existing[0].count);
    console.log(`📊 Subscriptions esistenti: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log('✅ Nessuna subscription da eliminare.');
      return;
    }

    // 2. Mostra dettagli per conferma
    const details = await sql`
      SELECT ps.id, ps.created_at, u.email, ps.endpoint
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      ORDER BY ps.created_at DESC
    `;

    console.log('📋 Subscriptions che saranno eliminate:\n');
    details.forEach((sub, i) => {
      const isApple = sub.endpoint.includes('web.push.apple');
      const isFCM = sub.endpoint.includes('fcm.googleapis');
      const age = ((new Date() - new Date(sub.created_at)) / (1000 * 60 * 60)).toFixed(1);
      
      console.log(`${i + 1}. ${sub.email}`);
      console.log(`   ID: ${sub.id}`);
      console.log(`   Tipo: ${isApple ? '🍎 iOS/Safari' : isFCM ? '🤖 Android/Chrome' : '❓'}`);
      console.log(`   Età: ${age} ore`);
      console.log(`   Created: ${sub.created_at}`);
      console.log('');
    });

    // 3. Richiedi conferma (commentato per sicurezza)
    console.log('\n⚠️  PER PROCEDERE:');
    console.log('   1. Leggi attentamente la lista sopra');
    console.log('   2. Decomment la riga "await sql..." nel codice');
    console.log('   3. Ri-esegui lo script\n');

    // DECOMMENT QUESTA RIGA PER ELIMINARE:
    // const result = await sql`DELETE FROM push_subscriptions`;
    
    // console.log(`\n✅ Eliminate ${result.length} subscriptions!`);
    // console.log('\n📝 PROSSIMI PASSI:');
    // console.log('   1. Vai su: https://www.maskiobarberconcept.it/area-personale/profilo');
    // console.log('   2. Clicca "Attiva Notifiche"');
    // console.log('   3. Accetta i permessi del browser');
    // console.log('   4. Testa con "Test Notifica"');

    console.log('🔒 SICUREZZA: Script in modalità "dry-run" (nessuna modifica)');

  } catch (error) {
    console.error('❌ Errore:', error.message);
    throw error;
  }
}

deleteAllSubscriptions();
