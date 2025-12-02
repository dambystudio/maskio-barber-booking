import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🧪 TEST WAITLIST - Verifica user_id\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function test() {
  try {
    // 1. Verifica utente test
    console.log('1️⃣  Verifica utente test@gmail.com...');
    const users = await sql`SELECT id, email, name FROM users WHERE email = 'test@gmail.com'`;
    
    if (users.length === 0) {
      console.log('❌ Utente test@gmail.com NON trovato!');
      console.log('   Crea l\'utente o usa un\'altra email.');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Utente trovato: ${user.name} (ID: ${user.id})\n`);

    // 2. Controlla iscrizioni waitlist
    console.log('2️⃣  Controllo iscrizioni waitlist per questo utente...');
    
    // Cerca con user_id
    const withUserId = await sql`
      SELECT COUNT(*) as count 
      FROM waitlist 
      WHERE user_id = ${user.id}
    `;
    
    console.log(`   📊 Iscrizioni con user_id: ${withUserId[0].count}`);
    
    // Cerca con customer_email
    const withEmail = await sql`
      SELECT COUNT(*) as count 
      FROM waitlist 
      WHERE customer_email = ${user.email}
    `;
    
    console.log(`   📊 Iscrizioni con customer_email: ${withEmail[0].count}`);
    
    // Cerca con customer_email ma user_id NULL
    const withEmailNoUserId = await sql`
      SELECT COUNT(*) as count 
      FROM waitlist 
      WHERE customer_email = ${user.email}
        AND user_id IS NULL
    `;
    
    console.log(`   ⚠️  Iscrizioni con email ma user_id NULL: ${withEmailNoUserId[0].count}\n`);
    
    // 3. Mostra iscrizioni recenti
    console.log('3️⃣  Ultime 5 iscrizioni per questo utente:\n');
    
    const entries = await sql`
      SELECT 
        id,
        user_id,
        barber_name,
        date,
        time,
        status,
        created_at
      FROM waitlist
      WHERE customer_email = ${user.email}
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    if (entries.length === 0) {
      console.log('   📭 Nessuna iscrizione trovata.');
    } else {
      entries.forEach((entry, i) => {
        console.log(`   ${i + 1}. ${entry.barber_name} - ${entry.date} alle ${entry.time}`);
        console.log(`      User ID: ${entry.user_id || '❌ NULL'}`);
        console.log(`      Status: ${entry.status}`);
        console.log(`      Created: ${new Date(entry.created_at).toLocaleString('it-IT')}`);
        console.log('');
      });
    }
    
    // 4. Suggerimenti
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 SUGGERIMENTI:\n');
    
    if (withEmailNoUserId[0].count > 0) {
      console.log('⚠️  Hai iscrizioni vecchie con user_id NULL!');
      console.log('   Questo è normale per record creati prima del fix.');
      console.log('   Il test ora supporta entrambi i casi (user_id e customer_email).\n');
      
      console.log('📌 Per testare il nuovo sistema:');
      console.log('   1. Cancella iscrizioni vecchie: node check-waitlist-entries.mjs');
      console.log('   2. Ri-esegui iscrizione da PWA mobile');
      console.log('   3. Verifica che nuovo record abbia user_id popolato\n');
    } else if (withUserId[0].count > 0) {
      console.log('✅ Tutte le iscrizioni hanno user_id popolato!');
      console.log('   Il sistema funziona correttamente.\n');
    } else {
      console.log('📭 Nessuna iscrizione trovata per questo utente.');
      console.log('   Prova a iscriverti alla lista d\'attesa da PWA mobile.\n');
    }
    
  } catch (error) {
    console.error('❌ ERRORE:', error);
    console.error(error.message);
  }
}

test();
