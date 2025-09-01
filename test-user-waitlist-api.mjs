import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function testUserWaitlistAPI() {
  console.log('🔍 Test API User Waitlist...\n');

  try {
    // 1. Mostriamo tutte le prenotazioni in waitlist
    console.log('1. Tutte le prenotazioni in waitlist:');
    const allEntries = await sql`
      SELECT * FROM waitlist 
      WHERE status = 'waiting'
      ORDER BY created_at DESC;
    `;

    console.log(`📊 Trovate ${allEntries.length} prenotazioni:`);
    allEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.customer_name} (${entry.customer_email}) - ${entry.barber_name} - ${entry.date}`);
    });

    // 2. Test specifico per email
    if (allEntries.length > 0) {
      const testEmail = allEntries[0].customer_email;
      console.log(`\n2. Test filtro per email: ${testEmail}`);
      
      const userEntries = await sql`
        SELECT w.*, u.name as user_name, u.email as user_email
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.status = 'waiting'
        AND w.customer_email = ${testEmail}
        ORDER BY w.date ASC, w.created_at ASC
      `;

      console.log(`📋 Risultati per ${testEmail}: ${userEntries.length} prenotazioni`);
      userEntries.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.customer_name} - ${entry.barber_name} - ${entry.date} (Pos: ${entry.position})`);
      });
    }

    // 3. Verifichiamo la struttura dati che l'API dovrebbe restituire
    console.log('\n3. Controllo struttura dati API...');
    if (allEntries.length > 0) {
      const entry = allEntries[0];
      console.log('Campi disponibili in ogni entry:');
      Object.keys(entry).forEach(key => {
        console.log(`   - ${key}: ${entry[key]}`);
      });
    }

  } catch (error) {
    console.error('❌ Errore nel test:', error.message);
  }
}

testUserWaitlistAPI();
