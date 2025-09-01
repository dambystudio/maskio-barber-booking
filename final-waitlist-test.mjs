import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function finalWaitlistTest() {
  console.log('🧪 Final Waitlist System Test...\n');

  try {
    // 1. Verifica struttura tabella
    console.log('1. Verifying waitlist table structure...');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'waitlist'
      ORDER BY ordinal_position
    `;
    
    console.log('✅ Table structure:', tableInfo.length, 'columns');

    // 2. Controlla i dati esistenti
    console.log('\n2. Current waitlist entries:');
    const entries = await sql`
      SELECT customer_name, customer_email, barber_name, date, status, position
      FROM waitlist 
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${entries.length} entries:`);
    entries.forEach((entry, i) => {
      console.log(`   ${i+1}. ${entry.customer_name} (${entry.customer_email}) → ${entry.barber_name} on ${entry.date} [${entry.status}]`);
    });

    // 3. Test della query API per ogni entry
    console.log('\n3. Testing API queries:');
    for (const entry of entries) {
      const apiResult = await sql`
        SELECT w.*, u.name as user_name, u.email as user_email
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        WHERE w.status = 'waiting'
        AND w.customer_email = ${entry.customer_email}
        ORDER BY w.date ASC, w.created_at ASC
      `;
      
      console.log(`   Query for ${entry.customer_email}: ${apiResult.length} results`);
      if (apiResult.length > 0) {
        console.log(`     → ${apiResult[0].customer_name} waiting for ${apiResult[0].barber_name} on ${apiResult[0].date}`);
      }
    }

    console.log('\n✅ Test completato! Il sistema dovrebbe funzionare correttamente.');
    console.log('\n📝 Per testare nel browser:');
    console.log('   1. Accedi con email: prova@gmail.com');
    console.log('   2. Vai al profilo utente: /area-personale/profilo');
    console.log('   3. Controlla la sezione "📋 Le Mie Liste d\'Attesa"');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

finalWaitlistTest();
