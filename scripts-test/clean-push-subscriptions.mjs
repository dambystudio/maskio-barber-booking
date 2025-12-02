import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🧹 PULIZIA PUSH SUBSCRIPTIONS\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function cleanSubscriptions() {
  try {
    // 1. Statistiche attuali
    console.log('📊 STATISTICHE ATTUALI:\n');
    
    const totalSubs = await sql`SELECT COUNT(*) as count FROM push_subscriptions`;
    console.log(`   Totale subscriptions: ${totalSubs[0].count}`);
    
    const byUser = await sql`
      SELECT 
        u.email,
        COUNT(ps.id) as count
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      GROUP BY u.email
      ORDER BY count DESC
      LIMIT 10
    `;
    
    console.log('\n   Top 10 utenti per subscriptions:');
    byUser.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.email}: ${row.count} subscriptions`);
    });
    
    // 2. Trova subscriptions duplicate (stesso endpoint)
    console.log('\n\n🔍 CERCO DUPLICATI...\n');
    
    const duplicates = await sql`
      SELECT 
        endpoint,
        COUNT(*) as count,
        MIN(created_at) as first_created,
        MAX(created_at) as last_created
      FROM push_subscriptions
      GROUP BY endpoint
      HAVING COUNT(*) > 1
    `;
    
    if (duplicates.length > 0) {
      console.log(`   ⚠️  Trovati ${duplicates.length} endpoint duplicati!`);
      console.log('   Mantengo solo la subscription più recente per ogni endpoint.\n');
      
      for (const dup of duplicates) {
        // Cancella le vecchie, mantieni la più recente
        await sql`
          DELETE FROM push_subscriptions
          WHERE endpoint = ${dup.endpoint}
            AND created_at < ${dup.last_created}
        `;
      }
      
      console.log(`   ✅ Rimossi duplicati!`);
    } else {
      console.log('   ✅ Nessun duplicato trovato.');
    }
    
    // 3. Opzionale: Mostra subscriptions per utente test
    console.log('\n\n👤 SUBSCRIPTIONS PER test@gmail.com:\n');
    
    const testUser = await sql`SELECT id FROM users WHERE email = 'test@gmail.com'`;
    
    if (testUser.length > 0) {
      const testSubs = await sql`
        SELECT 
          id,
          endpoint,
          user_agent,
          created_at
        FROM push_subscriptions
        WHERE user_id = ${testUser[0].id}
        ORDER BY created_at DESC
      `;
      
      console.log(`   Totale: ${testSubs.length} subscriptions\n`);
      
      testSubs.forEach((sub, i) => {
        console.log(`   ${i + 1}. ${sub.id}`);
        console.log(`      Endpoint: ${sub.endpoint.substring(0, 60)}...`);
        console.log(`      User Agent: ${sub.user_agent || 'N/A'}`);
        console.log(`      Created: ${new Date(sub.created_at).toLocaleString('it-IT')}`);
        console.log('');
      });
      
      // Opzione per cancellare subscriptions vecchie
      const OLD_THRESHOLD_DAYS = 30;
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - OLD_THRESHOLD_DAYS);
      
      const oldSubs = testSubs.filter(s => new Date(s.created_at) < oldDate);
      
      if (oldSubs.length > 0) {
        console.log(`\n   ⚠️  ${oldSubs.length} subscriptions più vecchie di ${OLD_THRESHOLD_DAYS} giorni`);
        console.log(`   💡 Per cancellarle, decommenta il codice qui sotto e ri-esegui.`);
        
        // DECOMMENTA PER CANCELLARE SUBSCRIPTIONS VECCHIE
        // await sql`
        //   DELETE FROM push_subscriptions
        //   WHERE user_id = ${testUser[0].id}
        //     AND created_at < ${oldDate.toISOString()}
        // `;
        // console.log('   ✅ Subscriptions vecchie cancellate!');
      }
    }
    
    // 4. Statistiche finali
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 STATISTICHE FINALI:\n');
    
    const finalTotal = await sql`SELECT COUNT(*) as count FROM push_subscriptions`;
    console.log(`   Totale subscriptions: ${finalTotal[0].count}`);
    console.log(`   Rimossi: ${totalSubs[0].count - finalTotal[0].count}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ ERRORE:', error);
    console.error(error.message);
  }
}

cleanSubscriptions();
