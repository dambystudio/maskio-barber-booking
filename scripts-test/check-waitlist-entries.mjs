import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🔍 VERIFICA ISCRIZIONI WAITLIST\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

try {
  // Recupera tutte le iscrizioni recenti
  console.log('📋 Ultime 10 iscrizioni nella waitlist:\n');
  
  const entries = await sql`
    SELECT 
      id,
      user_id,
      barber_id,
      barber_name,
      date,
      time,
      service,
      price,
      customer_name,
      customer_email,
      status,
      position,
      created_at
    FROM waitlist
    ORDER BY created_at DESC
    LIMIT 10
  `;

  if (entries.length === 0) {
    console.log('❌ Nessuna iscrizione trovata nella waitlist!\n');
  } else {
    entries.forEach((entry, index) => {
      console.log(`\n${index + 1}. Iscrizione ID: ${entry.id}`);
      console.log(`   👤 Cliente: ${entry.customer_name} (${entry.customer_email})`);
      console.log(`   💈 Barbiere: ${entry.barber_name} (${entry.barber_id})`);
      console.log(`   📅 Data: ${entry.date} alle ${entry.time}`);
      console.log(`   ✂️  Servizio: ${entry.service || 'N/A'}`);
      console.log(`   💰 Prezzo: €${entry.price || 0}`);
      console.log(`   📊 Status: ${entry.status}`);
      console.log(`   🔢 Posizione: ${entry.position}`);
      console.log(`   🕐 Creata: ${new Date(entry.created_at).toLocaleString('it-IT')}`);
      console.log(`   🆔 User ID: ${entry.user_id || 'N/A'}`);
    });
  }

  // Verifica specifica per il test
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Verifica specifica per test (test@gmail.com, fabio, 2025-12-05):\n');

  const testUser = await sql`SELECT id FROM users WHERE email = 'test@gmail.com'`;
  
  if (testUser.length === 0) {
    console.log('❌ User test@gmail.com non trovato nel database!');
  } else {
    console.log(`✅ User ID: ${testUser[0].id}`);
    
    const testEntries = await sql`
      SELECT 
        id,
        date,
        time,
        service,
        status,
        position,
        created_at
      FROM waitlist
      WHERE user_id = ${testUser[0].id}
        AND barber_id = 'fabio'
        AND date = '2025-12-05'
      ORDER BY created_at DESC
    `;

    if (testEntries.length === 0) {
      console.log('❌ Nessuna iscrizione trovata per questo test!');
    } else {
      console.log(`\n✅ Trovate ${testEntries.length} iscrizioni per il test:\n`);
      testEntries.forEach((entry, i) => {
        console.log(`   ${i + 1}. ID: ${entry.id}`);
        console.log(`      📅 ${entry.date} alle ${entry.time}`);
        console.log(`      ✂️  ${entry.service || 'N/A'}`);
        console.log(`      📊 Status: ${entry.status}, Posizione: ${entry.position}`);
        console.log(`      🕐 ${new Date(entry.created_at).toLocaleString('it-IT')}`);
        console.log('');
      });
    }
  }

  // Statistiche generali
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Statistiche Waitlist:\n');

  const stats = await sql`
    SELECT 
      status,
      COUNT(*) as count
    FROM waitlist
    GROUP BY status
  `;

  stats.forEach(stat => {
    console.log(`   ${stat.status}: ${stat.count} iscrizioni`);
  });

  const total = await sql`SELECT COUNT(*) as total FROM waitlist`;
  console.log(`\n   TOTALE: ${total[0].total} iscrizioni`);

} catch (error) {
  console.error('\n❌ ERRORE:', error);
  console.error('\nDettagli:', error.message);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
