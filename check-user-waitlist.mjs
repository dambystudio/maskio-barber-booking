import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkUserAndWaitlist() {
  console.log('👤 Controllo utenti e corrispondenza waitlist...\n');

  try {
    // 1. Mostriamo tutti gli utenti registrati
    console.log('1. Utenti registrati:');
    const users = await sql`SELECT id, name, email, role FROM users ORDER BY created_at DESC LIMIT 10;`;
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // 2. Mostriamo le prenotazioni in waitlist
    console.log('\n2. Prenotazioni in waitlist:');
    const waitlistEntries = await sql`
      SELECT customer_name, customer_email, barber_name, date, status
      FROM waitlist 
      WHERE status = 'waiting'
      ORDER BY created_at DESC;
    `;

    waitlistEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.customer_name} (${entry.customer_email}) - ${entry.barber_name} - ${entry.date}`);
    });

    // 3. Cerchiamo corrispondenze
    console.log('\n3. Verifica corrispondenze email:');
    for (const waitlistEntry of waitlistEntries) {
      const matchingUser = users.find(user => user.email === waitlistEntry.customer_email);
      if (matchingUser) {
        console.log(`   ✅ ${waitlistEntry.customer_email} → Utente: ${matchingUser.name}`);
      } else {
        console.log(`   ❌ ${waitlistEntry.customer_email} → Nessun utente trovato`);
      }
    }

    // 4. Controlliamo se esistono altri waitlist per altri utenti
    console.log('\n4. Test API per email specifica:');
    if (waitlistEntries.length > 0) {
      const testEmail = waitlistEntries[0].customer_email;
      console.log(`   Testando API per email: ${testEmail}`);
      
      // Simuliamo la chiamata API
      const apiResult = await sql`
        SELECT w.*, u.name as user_name, u.email as user_email
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.status = 'waiting'
        AND w.customer_email = ${testEmail}
        ORDER BY w.date ASC, w.created_at ASC
      `;

      console.log(`   Risultato API: ${apiResult.length} prenotazioni trovate`);
    }

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

checkUserAndWaitlist();
