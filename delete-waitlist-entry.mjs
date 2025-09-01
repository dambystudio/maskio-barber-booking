import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function deleteWaitlistEntry() {
  console.log('🗑️ Eliminazione prenotazione dalla lista d\'attesa...\n');

  try {
    // 1. Prima mostriamo la prenotazione esistente
    console.log('1. Prenotazione da eliminare:');
    const existingEntry = await sql`
      SELECT * FROM waitlist 
      WHERE status = 'waiting'
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (existingEntry.length === 0) {
      console.log('❌ Nessuna prenotazione in lista d\'attesa trovata');
      return;
    }

    const entry = existingEntry[0];
    console.log(`   - Nome: ${entry.customer_name}`);
    console.log(`   - Barbiere: ${entry.barber_name}`);
    console.log(`   - Data: ${entry.date}`);
    console.log(`   - Posizione: ${entry.position}`);
    console.log(`   - Status: ${entry.status}`);
    console.log(`   - ID: ${entry.id}`);

    // 2. Eliminiamo la prenotazione
    console.log('\n2. Eliminazione in corso...');
    const deleteResult = await sql`
      DELETE FROM waitlist 
      WHERE id = ${entry.id}
      RETURNING *;
    `;

    if (deleteResult.length > 0) {
      console.log('✅ Prenotazione eliminata con successo!');
      console.log(`   - Eliminata: ${deleteResult[0].customer_name} per ${deleteResult[0].date}`);
    } else {
      console.log('❌ Errore nell\'eliminazione');
    }

    // 3. Verifichiamo che sia stata eliminata
    console.log('\n3. Verifica eliminazione...');
    const remainingEntries = await sql`
      SELECT COUNT(*) as count FROM waitlist 
      WHERE status = 'waiting';
    `;

    console.log(`📊 Prenotazioni in lista d'attesa rimaste: ${remainingEntries[0].count}`);

    // 4. Mostriamo eventuali altre prenotazioni
    if (remainingEntries[0].count > 0) {
      const otherEntries = await sql`
        SELECT customer_name, barber_name, date, position, status
        FROM waitlist 
        WHERE status = 'waiting'
        ORDER BY date, position;
      `;

      console.log('\n📋 Altre prenotazioni in attesa:');
      otherEntries.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.customer_name} - ${entry.barber_name} - ${entry.date} (Pos: ${entry.position})`);
      });
    } else {
      console.log('\n🎯 Lista d\'attesa ora è vuota!');
    }

    console.log('\n✨ Operazione completata!');

  } catch (error) {
    console.error('❌ Errore durante l\'eliminazione:', error.message);
    console.error('Stack:', error.stack);
  }
}

deleteWaitlistEntry();
